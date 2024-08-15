const mysql = require("../config/connection");

function searchController(req, resp) {
  const keyword = req.query.search;
  const params = [
    `%${keyword}%`,
    `%${keyword}%`,
    `%${keyword}%`,
    `%${keyword}%`,
    `%${keyword}%`,
    `%${keyword}%`,
  ];

  const searchAll = `
    SELECT * FROM sih_details.sih_details WHERE ID LIKE ? OR Title LIKE ? OR TechnologyBucket LIKE ? OR Category LIKE ? OR Description LIKE ? OR ProblemCreatersOrganization LIKE ?`;

  mysql.query(searchAll, params, (err, result) => {
    if (err) {
      handleError(
        resp,
        "An error occurred while searching the data. Please try again later."
      );
      return console.error("An error occurred while searching the data", err);
    }

    if (result.length === 0) {
      handleNoResults(resp);
      return console.error("No results found for the search query");
    }

    handleSuccess(resp, result);
  });
}

function handleError(resp, errorMsg) {
  const themeQry =
    "SELECT DISTINCT TechnologyBucket FROM sih_details.sih_details ORDER BY TechnologyBucket ASC";
  const categoryQry = "SELECT DISTINCT Category FROM sih_details.sih_details";
  const orgQry =
    "SELECT DISTINCT ProblemCreatersOrganization FROM sih_details.sih_details ORDER BY ProblemCreatersOrganization ASC";

  mysql.query(themeQry, (err, themeResult) => {
    if (err) throw err;
    mysql.query(categoryQry, (err, categoryResult) => {
      if (err) throw err;
      mysql.query(orgQry, (err, orgResult) => {
        if (err) throw err;
        mysql.query("SELECT * FROM sih_details.visitor_count", (err, countResult) => {
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
            countResult: countResult,
            error: errorMsg,
          });
        });
      });
    });
  });
}

function handleNoResults(resp) {
  const themeQry =
    "SELECT DISTINCT TechnologyBucket FROM sih_details.sih_details ORDER BY TechnologyBucket ASC";
  const categoryQry = "SELECT DISTINCT Category FROM sih_details.sih_details";
  const orgQry =
    "SELECT DISTINCT ProblemCreatersOrganization FROM sih_details.sih_details ORDER BY ProblemCreatersOrganization ASC";

  mysql.query(themeQry, (err, themeResult) => {
    if (err) throw err;
    mysql.query(categoryQry, (err, categoryResult) => {
      if (err) throw err;
      mysql.query(orgQry, (err, orgResult) => {
        if (err) throw err;
        mysql.query("SELECT * FROM sih_details.visitor_count", (err, countResult) => {
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
}

function handleSuccess(resp, result) {
  const themeQry =
    "SELECT DISTINCT TechnologyBucket FROM sih_details.sih_details ORDER BY TechnologyBucket ASC";
  const categoryQry = "SELECT DISTINCT Category FROM sih_details.sih_details";
  const orgQry =
    "SELECT DISTINCT ProblemCreatersOrganization FROM sih_details.sih_details ORDER BY ProblemCreatersOrganization ASC";

  mysql.query(themeQry, (err, themeResult) => {
    if (err) throw err;
    mysql.query(categoryQry, (err, categoryResult) => {
      if (err) throw err;
      mysql.query(orgQry, (err, orgResult) => {
        if (err) throw err;
        mysql.query("SELECT * FROM sih_details.visitor_count", (err, countResult) => {
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
}

module.exports = { searchController };
