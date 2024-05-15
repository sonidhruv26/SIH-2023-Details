const mysql = require("../config/connection");
const axios = require("axios");

const resultsPerPage = 10;

exports.getHomePage = async (req, resp) => {
  const ipAdd = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.clientIp;

  try {
    const response = await axios.get(`http://api.ipstack.com/${ipAdd}?access_key=YOUR_ACCESS_KEY`);
    const locationData = response.data;

    const currentTime = new Date();
    const formattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');

    const { ip, country, city, latitude, longitude } = locationData;
    const sql = `INSERT INTO visitor_locations (ip_address, country, city, latitude, longitude, time_zone) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE count = count + 1, time_zone = ?`;

    mysql.query(sql, [ip, country, city, latitude, longitude, formattedTime, formattedTime], (err) => {
      if (err) {
        console.error('Error:', err.message);
      }

      this.renderHomePage(req, resp);
    });
  } catch (error) {
    console.error('Error occurred at catch of / request:', error.message);
    this.renderHomePage(req, resp);
  }
};

exports.renderHomePage = (req, resp) => {
  const theme = "";
  const category = "";
  const org = "";

  const countUpdate = "Update visitor_count SET count = count + 1";
  const viewAll = "Select * from sih_details";

  mysql.query(viewAll, (err, result) => {
    if (err) throw err;

    const numOfResults = result.length;
    const numberOfPages = Math.ceil(numOfResults / resultsPerPage);

    let page = req.query.page ? Number(req.query.page) : 1;
    if (page > numberOfPages) {
      resp.redirect("/?page=" + encodeURIComponent(numberOfPages));
    } else if (page < 1) {
      resp.redirect("/?page=" + encodeURIComponent("1"));
    }

    const startingLimit = (page - 1) * resultsPerPage;

    mysql.query(`SELECT * FROM sih_details LIMIT ${startingLimit}, ${resultsPerPage}`, (err, result) => {
      if (err) throw err;

      let iterator = page - 2 > 0 ? page - 2 : 1;
      let endingLink = iterator + 4 <= numberOfPages ? iterator + 4 : numberOfPages;

      const paginationLinks = {
        previous: page > 1 ? `/?page=${page - 1}` : null,
        next: page < numberOfPages ? `/?page=${page + 1}` : null,
        pages: [],
      };

      for (let i = iterator; i <= endingLink; i++) {
        paginationLinks.pages.push({
          page: i,
          url: `/?page=${i}`,
          isActive: i === page,
        });
      }

      const themeQry = "SELECT DISTINCT TechnologyBucket FROM sih_details ORDER BY TechnologyBucket ASC";
      const categoryQry = "SELECT DISTINCT Category FROM sih_details";
      const orgQry = "SELECT DISTINCT ProblemCreatersOrganization FROM sih_details ORDER BY ProblemCreatersOrganization ASC";

      mysql.query(themeQry, (err, themeResult) => {
        if (err) throw err;
        mysql.query(categoryQry, (err, categoryResult) => {
          if (err) throw err;
          mysql.query(orgQry, (err, orgResult) => {
            if (err) throw err;
            mysql.query("SELECT * FROM visitor_count", (err, countResult) => {
              if (err) throw err;
              resp.render("index", {
                data: result,
                page,
                iterator,
                endingLink,
                numberOfPages,
                themeResult,
                categoryResult,
                orgResult,
                theme,
                category,
                org,
                paginationLinks,
                countResult,
              });
            });
          });
        });
      });
    });
  });

  mysql.query(countUpdate, (err) => {
    if (err) throw err;
  });
};
