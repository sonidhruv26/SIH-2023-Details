const mysql = require("../config/connection");

exports.search = (req, resp) => {
  const { keyword } = req.query;
  params = [keyword];
  const searchAll = `SELECT * FROM sih_details WHERE Title LIKE '%?%'`;

  mysql.query(searchAll, params, (err, result) => {
    if (err) {
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
                data: [],
                page: 1,
                iterator: 1,
                endingLink: 1,
                numberOfPages: 1,
                themeResult: [],
                categoryResult: [],
                orgResult: [],
                theme: "",
                category: "",
                org: "",
                paginationLinks: {
                  previous: null,
                  next: null,
                },
                countResult: [],
                error:
                  "An error occurred while searching the data. Please try again later.",
              });
            });
          });
        });
      });

      return console.error("An error occurred while searching the data", err);
    }

    if (result.length === 0) {
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
                data: [],
                page: 1,
                iterator: 1,
                endingLink: 1,
                numberOfPages: 1,
                themeResult,
                categoryResult,
                orgResult,
                theme: "",
                category: "",
                org: "",
                paginationLinks: {
                  previous: null,
                  next: null,
                },
                countResult,
                error: "No results found for the search query.",
              });
            });
          });
        });
      });

      return console.error("No results found for the search query");
    }

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
              page: 1,
              iterator: 1,
              endingLink: 1,
              numberOfPages: 1,
              themeResult,
              categoryResult,
              orgResult,
              theme: "",
              category: "",
              org: "",
              paginationLinks: {
                previous: null,
                next: null,
              },
              countResult,
            });
          });
        });
      });
    });
  });
};
