const mysql = require("../config/connection");

const resultsPerPage = 10;

exports.getFilteredResults = (req, resp) => {
  console.log("Filtering the data");

  const theme = req.query.theme || "";
  const category = req.query.category || "";
  const org = req.query.org || "";

  let viewAll;
  let params = [];

  switch (true) {
    case theme === "" && category === "" && org === "":
      viewAll = `SELECT * FROM sih_details`;
      break;
    case theme === "" && category === "":
      viewAll = `SELECT * FROM sih_details WHERE ProblemCreatersOrganization = ?`;
      params.push(org);
      break;
    case theme === "" && org === "":
      viewAll = `SELECT * FROM sih_details WHERE Category = ?`;
      params.push(category);
      break;
    case category === "" && org === "":
      viewAll = `SELECT * FROM sih_details WHERE TechnologyBucket = ?`;
      params.push(theme);
      break;
    case theme === "":
      viewAll = `SELECT * FROM sih_details WHERE Category = ? AND ProblemCreatersOrganization = ?`;
      params.push(category, org);
      break;
    case category === "":
      viewAll = `SELECT * FROM sih_details WHERE TechnologyBucket = ? AND ProblemCreatersOrganization = ?`;
      params.push(theme, org);
      break;
    case org === "":
      viewAll = `SELECT * FROM sih_details WHERE TechnologyBucket = ? AND Category = ?`;
      params.push(theme, category);
      break;
    default:
      viewAll = `SELECT * FROM sih_details WHERE TechnologyBucket = ? AND Category = ? AND ProblemCreatersOrganization = ?`;
      params.push(theme, category, org);
      break;
  }

  mysql.query(viewAll, params, (err, result) => {
    // console.log("result: ", result);

    if (err) {
      console.error("An error occurred while filtering the data", err);
      resp.render("index", {
        data: [],
        page: 1,
        iterator: 1,
        endingLink: 1,
        numberOfPages: 1,
        themeResult: [],
        categoryResult: [],
        orgResult: [],
        theme,
        category,
        org,
        paginationLinks: {
          previous: null,
          next: null,
        },
        countResult: [],
        error: "An error occurred while filtering the data. Please try again.",
      });

      return console.error("An error occurred while filtering the data", err);
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
                theme,
                category,
                org,
                paginationLinks: {
                  previous: null,
                  next: null,
                },
                countResult,
                error:
                  "No results found. Please try again with different filters.",
              });
            });
          });
        });
      });

      return console.log(
        "No results found. Please try again with different filters."
      );
    }

    console.log("Data filtered successfully");

    const numOfResults = result.length;
    const numberOfPages = Math.ceil(numOfResults / resultsPerPage);

    let page = req.query.page ? Number(req.query.page) : 1;
    if (page < 1) page = 1;
    if (page > numberOfPages) page = numberOfPages;

    const startingLimit = (page - 1) * resultsPerPage;

    mysql.query(
      viewAll + `LIMIT ${startingLimit}, ${resultsPerPage}`, params,
      (err, result) => {
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
          previous:
            page > 1
              ? `/filter?page=${
                  page - 1
                }&theme=${theme}&category=${category}&org=${org}`
              : null,
          next:
            page < numberOfPages
              ? `/filter?page=${
                  page + 1
                }&theme=${theme}&category=${category}&org=${org}`
              : null,
        };

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
                  countResult,
                });
              });
            });
          });
        });
      }
    );
  });
};
