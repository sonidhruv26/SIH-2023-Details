const express = require("express");
const app = express();
const axios = require('axios');
const requestIp = require('request-ip');
const bodyparser = require("body-parser");
const encoder = bodyparser.urlencoded();
const mysql = require("./connection");
require("dotenv").config();
const port = process.env.PORT || 80;

app.set("view engine", "ejs");
app.set("views", "./Views");
app.use(express.static(__dirname + "/Public"));
app.use(requestIp.mw());

const resultsPerPage = 10;

app.get("/", async (req, resp) => {

  const ipAdd = req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.clientIp;
  

  try {
    const response = await axios.get(`http://api.ipstack.com/${ipAdd}?access_key=5c2243be17b627e61439797c8b5a832a`);
    const locationData = response.data;
    console.log(locationData);

    const { ip, country, city, latitude, longitude, time_zone } = locationData;
    const sql = `INSERT INTO visitor_locations (ip_address, country, city, latitude, longitude, time_zone) 
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE count = count + 1`;

    mysql.query(sql, [ip, country, city, latitude, longitude, time_zone], (err, result) => {
      if (err) {
        console.error('Error:', err.message);
      }

      theme = "";
      category = "";
      org = "";

      let countUpdate = "Update visitor_count SET count = count + 1";
      let viewAll = "Select * from sih_details";
      mysql.query(viewAll, (err, result) => {
        if (err) throw err;

        const numOfResults = result.length;
        const numberOfPages = Math.ceil(numOfResults / resultsPerPage);

        let page = req.query.page ? Number(req.query.page) : 1;
        // console.log(page);
        if (page > numberOfPages) {
          resp.redirect("/?page=" + encodeURIComponent(numberOfPages));
        } else if (page < 1) {
          resp.redirect("/?page=" + encodeURIComponent("1"));
        }

        // Determine the SQL limit starting number
        const startingLimit = (page - 1) * resultsPerPage;
        // Get the relevant number of problems for this starting page
        viewAll = `Select * from sih_details LIMIT ${startingLimit}, ${resultsPerPage}`;
        mysql.query(viewAll, (err, result) => {
          if (err) throw err;
          let iterator = page - 2 > 0 ? page - 2 : 1;
          let endingLink =
            iterator + 4 <= numberOfPages ? iterator + 4 : numberOfPages;
          if (endingLink < page + 2) {
            iterator -= page + 2 - numberOfPages;
          }

          const startPage = Math.max(1, page - 2);
          const endPage = Math.min(numberOfPages, startPage + 4);

          const paginationLinks = {
            previous: page > 1 ? `/?page=${page - 1}` : null,
            next: page < numberOfPages ? `/?page=${page + 1}` : null,
            pages: [],
          };

          for (let i = startPage; i <= endPage; i++) {
            paginationLinks.pages.push({
              page: i,
              url: `/?page=${i}`,
              isActive: i === page,
            });
          }

          // For filter select-items
          const themeQry =
            "SELECT DISTINCT TechnologyBucket FROM sih_details ORDER BY TechnologyBucket ASC";
          const categoryQry = "SELECT DISTINCT Category FROM sih_details";
          const orgQry =
            "SELECT DISTINCT ProblemCreatersOrganization FROM sih_details ORDER BY ProblemCreatersOrganization ASC";

          mysql.query(themeQry, (err, themeResult) => {
            if (err) throw err;
            mysql.query(categoryQry, (err, categoryResult) => {
              if (err) throw err;
              mysql.query(orgQry, (err, orgResult) => {
                if (err) throw err;
                mysql.query(countUpdate, (err, countUpdate) => {
                  if (err) throw err;
                  mysql.query("SELECT * FROM visitor_count", (err, countResult) => {
                    if (err) throw err;
                    // console.log(countResult[0].count);
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
                      countResult
                    });
                  });
                });
              });
            });
          });

        });

      });
    });
  } catch (error) {
    console.error('Error:', error.message);

    theme = "";
    category = "";
    org = "";

    let countUpdate = "Update visitor_count SET count = count + 1";
    let viewAll = "Select * from sih_details";
    mysql.query(viewAll, (err, result) => {
      if (err) throw err;

      const numOfResults = result.length;
      const numberOfPages = Math.ceil(numOfResults / resultsPerPage);

      let page = req.query.page ? Number(req.query.page) : 1;
      // console.log(page);
      if (page > numberOfPages) {
        resp.redirect("/?page=" + encodeURIComponent(numberOfPages));
      } else if (page < 1) {
        resp.redirect("/?page=" + encodeURIComponent("1"));
      }

      // Determine the SQL limit starting number
      const startingLimit = (page - 1) * resultsPerPage;
      // Get the relevant number of problems for this starting page
      viewAll = `Select * from sih_details LIMIT ${startingLimit}, ${resultsPerPage}`;
      mysql.query(viewAll, (err, result) => {
        if (err) throw err;
        let iterator = page - 2 > 0 ? page - 2 : 1;
        let endingLink =
          iterator + 4 <= numberOfPages ? iterator + 4 : numberOfPages;
        if (endingLink < page + 2) {
          iterator -= page + 2 - numberOfPages;
        }

        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(numberOfPages, startPage + 4);

        const paginationLinks = {
          previous: page > 1 ? `/?page=${page - 1}` : null,
          next: page < numberOfPages ? `/?page=${page + 1}` : null,
          pages: [],
        };

        for (let i = startPage; i <= endPage; i++) {
          paginationLinks.pages.push({
            page: i,
            url: `/?page=${i}`,
            isActive: i === page,
          });
        }

        // For filter select-items
        const themeQry =
          "SELECT DISTINCT TechnologyBucket FROM sih_details ORDER BY TechnologyBucket ASC";
        const categoryQry = "SELECT DISTINCT Category FROM sih_details";
        const orgQry =
          "SELECT DISTINCT ProblemCreatersOrganization FROM sih_details ORDER BY ProblemCreatersOrganization ASC";

        mysql.query(themeQry, (err, themeResult) => {
          if (err) throw err;
          mysql.query(categoryQry, (err, categoryResult) => {
            if (err) throw err;
            mysql.query(orgQry, (err, orgResult) => {
              if (err) throw err;
              mysql.query(countUpdate, (err, countUpdate) => {
                if (err) throw err;
                mysql.query("SELECT * FROM visitor_count", (err, countResult) => {
                  if (err) throw err;
                  // console.log(countResult[0].count);
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
                    countResult
                  });
                });
              });
            });
          });
        });

      });

    });
  }

});

app.get("/search", (req, resp) => {
  const searchTerm = req.query.search;

  theme = "";
  category = "";
  org = "";

  const query = `SELECT * FROM sih_details WHERE ID LIKE ? OR Title LIKE ? OR TechnologyBucket LIKE ? OR Category LIKE ? OR ProblemCreatersOrganization LIKE ?`;
  const params = Array(5).fill(`%${searchTerm}%`);

  mysql.query(query, params, (err, searchResults) => {
    if (err) {
      console.error(err);
      resp.status(500).send('Error searching the database');
    } else {

      const numOfResults = searchResults.length;
      const numberOfPages = Math.ceil(numOfResults / resultsPerPage);

      let page = req.query.page ? Number(req.query.page) : 1;
      // console.log(page);
      if (page > numberOfPages) {
        resp.redirect(`/search?search=${searchTerm}&page=${numberOfPages}`);
      } else if (page < 1) {
        resp.redirect(`/search?search=${searchTerm}&page=1`);
      }

      // Determine the SQL limit starting number
      const startingLimit = (page - 1) * resultsPerPage;
      // Get the relevant number of problems for this starting page
      viewAll = `Select * from sih_details LIMIT ${startingLimit}, ${resultsPerPage}`;
      mysql.query(viewAll, (err, result) => {
        if (err) throw err;
        let iterator = page - 2 > 0 ? page - 2 : 1;
        let endingLink = iterator + 4 <= numberOfPages ? iterator + 4 : numberOfPages;
        if (endingLink - iterator < 4) {
          iterator = Math.max(1, endingLink - 4);
        }

        const startPage = Math.max(1, iterator);
        const endPage = Math.min(numberOfPages, endingLink);

        const paginationLinks = {
          previous: page > 1 ? `/search?search=${searchTerm}&page=${page - 1}` : null,
          next: page < numberOfPages ? `/search?search=${searchTerm}&page=${page + 1}` : null,
          pages: [],
        };

        for (let i = startPage; i <= endPage; i++) {
          paginationLinks.pages.push({
            page: i,
            url: `/?page=${i}`,
            isActive: i === page,
          });
        }

        // For filter select-items
        const themeQry =
          "SELECT DISTINCT TechnologyBucket FROM sih_details ORDER BY TechnologyBucket ASC";
        const categoryQry = "SELECT DISTINCT Category FROM sih_details";
        const orgQry =
          "SELECT DISTINCT ProblemCreatersOrganization FROM sih_details ORDER BY ProblemCreatersOrganization ASC";

        mysql.query(themeQry, (err, themeResult) => {
          if (err) throw err;
          mysql.query(categoryQry, (err, categoryResult) => {
            if (err) throw err;
            mysql.query(orgQry, (err, orgResult) => {
              if (err) throw err;
              mysql.query("SELECT * FROM visitor_count", (err, countResult) => {
                if (err) throw err;
                resp.render("index", {
                  data: searchResults,
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
                  countResult
                });
              });
            });
          });
        });
      });
    }
  });
});

app.get("/filter", (req, resp) => {
  const theme = req.query.theme;
  const category = req.query.category;
  const org = req.query.org;

  // console.log(theme, category, org);

  if (theme === `` && category === `` && org === ``) {
    viewAll = `Select * from sih_details `;
  } else if (theme === `` && category === ``) {
    viewAll = `Select * from sih_details WHERE ProblemCreatersOrganization = '${org}' `;
  } else if (theme === `` && org === ``) {
    viewAll = `Select * from sih_details WHERE Category = '${category}' `;
  } else if (category === `` && org === ``) {
    viewAll = `Select * from sih_details WHERE TechnologyBucket = '${theme}' `;
  } else if (theme === ``) {
    viewAll = `Select * from sih_details WHERE Category = '${category}' AND ProblemCreatersOrganization = '${org}' `;
  } else if (category === ``) {
    viewAll = `Select * from sih_details WHERE TechnologyBucket = '${theme}' AND ProblemCreatersOrganization = '${org}' `;
  } else if (org === ``) {
    viewAll = `Select * from sih_details WHERE TechnologyBucket = '${theme}' AND Category = '${category}' `;
  } else {
    viewAll = `Select * from sih_details WHERE TechnologyBucket = '${theme}' AND Category = '${category}' AND ProblemCreatersOrganization = '${org}' `;
  }

  mysql.query(viewAll, (err, result) => {
    // console.log(result);
    if (err) throw err;
    const numOfResults = result.length;
    let numberOfPages;
    if (numOfResults >= resultsPerPage) {
      numberOfPages = Math.ceil(numOfResults / resultsPerPage);
    } else {
      numberOfPages = 1;
    }

    let page = req.query.page ? Number(req.query.page) : 1;
    console.log(req.query.page);
    if (page > numberOfPages) {
      resp.redirect("&page=" + encodeURIComponent(numberOfPages));
    } else if (page < 1) {
      resp.redirect("&page=" + encodeURIComponent("1"));
    }

    // Determine the SQL limit starting number
    const startingLimit = (page - 1) * resultsPerPage;

    mysql.query(viewAll + `LIMIT ${startingLimit}, ${resultsPerPage}`, (err, result) => {

      if (err) throw err;
      let iterator = 1; // Initialize iterator to 1
      let endingLink = Math.min(iterator + 4, numberOfPages); // Ensure endingLink is within bounds

      // Adjust iterator and endingLink based on the page number
      if (page > 1) {
        iterator = Math.max(page - 2, 1); // Adjust iterator based on the page
        endingLink = Math.min(iterator + 4, numberOfPages); // Ensure endingLink is within bounds

        if (endingLink < page + 2) {
          iterator -= page + 2 - endingLink; // Adjust iterator if endingLink is less than expected
          endingLink = Math.min(iterator + 4, numberOfPages); // Re-calculate endingLink
        }
      }

      const paginationLinks = {
        previous: page > 1 ? `/filter?page=${page - 1}&theme=${theme}&category=${category}&org=${org}` : null,
        next: page < numberOfPages ? `/filter?page=${page + 1}&theme=${theme}&category=${category}&org=${org}` : null
      };

      // For filter results
      const themeQry =
        "SELECT DISTINCT TechnologyBucket FROM sih_details ORDER BY TechnologyBucket ASC";
      const categoryQry = "SELECT DISTINCT Category FROM sih_details";
      const orgQry =
        "SELECT DISTINCT ProblemCreatersOrganization FROM sih_details ORDER BY ProblemCreatersOrganization ASC";

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
                countResult
              });
            })
          });
        });
      });
    });
  });
});

app.listen(process.env.PORT || port, () => {
  console.log(`Listening on port ${port}`);
});