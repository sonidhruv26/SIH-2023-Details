const mysql = require("../config/connection");

exports.search = (req, resp) => {
  const { keyword } = req.query;
  const searchAll = `SELECT * FROM sih_details WHERE ProblemTitle LIKE '%${keyword}%'`;

  mysql.query(searchAll, (err, result) => {
    if (err) {
      console.error('Error:', err.message);
      return resp.status(500).send('An error occurred while searching the data');
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
              paginationLinks: null,
              countResult,
              keyword,
            });
          });
        });
      });
    });
  });
};
