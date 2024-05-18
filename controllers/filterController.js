const mysql = require("../config/connection");

const resultsPerPage = 10;

exports.getFilteredResults = (req, resp) => {
  const theme = req.query.theme || "";
  const category = req.query.category || "";
  const org = req.query.org || "";

  let viewAll;

  if (theme === "" && category === "" && org === "") {
    viewAll = `SELECT * FROM sih_details`;
  } else if (theme === "" && category === "") {
    viewAll = `SELECT * FROM sih_details WHERE ProblemCreatersOrganization = '${org}'`;
  } else if (theme === "" && org === "") {
    viewAll = `SELECT * FROM sih_details WHERE Category = '${category}'`;
  } else if (category === "" && org === "") {
    viewAll = `SELECT * FROM sih_details WHERE TechnologyBucket = '${theme}'`;
  } else if (theme === "") {
    viewAll = `SELECT * FROM sih_details WHERE Category = '${category}' AND ProblemCreatersOrganization = '${org}'`;
  } else if (category === "") {
    viewAll = `SELECT * FROM sih_details WHERE TechnologyBucket = '${theme}' AND ProblemCreatersOrganization = '${org}'`;
  } else if (org === "") {
    viewAll = `SELECT * FROM sih_details WHERE TechnologyBucket = '${theme}' AND Category = '${category}'`;
  } else {
    viewAll = `SELECT * FROM sih_details WHERE TechnologyBucket = '${theme}' AND Category = '${category}' AND ProblemCreatersOrganization = '${org}'`;
  }

  mysql.query(viewAll, (err, result) => {
    if (err) {
      console.error('Error:', err.message);
      // render same page with error message
      return resp.render("index", {
        data: [],
        page: 1,
        iterator: 1,
        endingLink: 1,
        numberOfPages: 1,
        theme: "",
        category: "",
        org: "",
        paginationLinks: {
          previous: null,
          next: null,
        },
        countResult: [],
        error: "No results found. Please try again with different filters",
      });
    }

    const numOfResults = result.length;
    const numberOfPages = Math.ceil(numOfResults / resultsPerPage);

    let page = req.query.page ? Number(req.query.page) : 1;
    if (page > numberOfPages) {
      resp.redirect(`/?page=${numberOfPages}`);
    } else if (page < 1) {
      resp.redirect(`/?page=1`);
    }

    const startingLimit = (page - 1) * resultsPerPage;

    mysql.query(viewAll + ` LIMIT ${startingLimit}, ${resultsPerPage}`, (err, result) => {
      if (err) throw err;

      let iterator = 1;
      let endingLink = Math.min(iterator + 4, numberOfPages);

      if (page > 1) {
        iterator = Math.max(page - 2, 1);
        endingLink = Math.min(iterator + 4, numberOfPages);

        if (endingLink < page + 2) {
          iterator -= page + 2 - endingLink;
          endingLink = Math.min(iterator + 4, numberOfPages);
        }
      }

      const paginationLinks = {
        previous: page > 1 ? `/filter?page=${page - 1}&theme=${theme}&category=${category}&org=${org}` : null,
        next: page < numberOfPages ? `/filter?page=${page + 1}&theme=${theme}&category=${category}&org=${org}` : null,
      };

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
};
