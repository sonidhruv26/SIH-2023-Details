const mysql = require("../config/connection");

const resultsPerPage = 10;

exports.getFilteredResults = (req, resp) => {
  console.log("Filtering the data");

  const theme = req.query.theme || "";
  const category = req.query.category || "";
  const org = req.query.org || "";
  const searchQuery = req.query.search || "";

  let baseQuery = "SELECT * FROM sih_details WHERE 1=1";
  let params = [];

  // Apply search query
  if (searchQuery) {
    baseQuery += ` AND (Title LIKE ? OR TechnologyBucket LIKE ? OR Category LIKE ? OR Description LIKE ? OR ProblemCreatersOrganization LIKE ?)`;
    const keyword = `%${searchQuery}%`;
    params.push(keyword, keyword, keyword, keyword, keyword);
  }

  // Apply filters to the search results
  if (theme) {
    baseQuery += ` AND TechnologyBucket = ?`;
    params.push(theme);
  }

  if (category) {
    baseQuery += ` AND Category = ?`;
    params.push(category);
  }

  if (org) {
    baseQuery += ` AND ProblemCreatersOrganization = ?`;
    params.push(org);
  }

  mysql.query(baseQuery, params, (err, result) => {
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
        searchQuery,
        paginationLinks: {
          previous: null,
          next: null,
        },
        countResult: [],
        error: "An error occurred while filtering the data. Please try again.",
      });
      return;
    }

    if (result.length === 0) {
      fetchDropdownsAndRender(resp, {
        data: [],
        page: 1,
        iterator: 1,
        endingLink: 1,
        numberOfPages: 1,
        theme,
        category,
        org,
        searchQuery,
        paginationLinks: {
          previous: null,
          next: null,
        },
        error: "No results found. Please try again with different filters.",
      });
      return;
    }

    console.log("Data filtered successfully");

    const numOfResults = result.length;
    const numberOfPages = Math.ceil(numOfResults / resultsPerPage);

    let page = req.query.page ? Number(req.query.page) : 1;
    if (page < 1) page = 1;
    if (page > numberOfPages) page = numberOfPages;

    const startingLimit = (page - 1) * resultsPerPage;

    mysql.query(
      baseQuery + ` LIMIT ${startingLimit}, ${resultsPerPage}`,
      params,
      (err, paginatedResult) => {
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
                }&theme=${theme}&category=${category}&org=${org}&search=${searchQuery}`
              : null,
          next:
            page < numberOfPages
              ? `/filter?page=${
                  page + 1
                }&theme=${theme}&category=${category}&org=${org}&search=${searchQuery}`
              : null,
        };

        fetchDropdownsAndRender(resp, {
          data: paginatedResult,
          page,
          iterator,
          endingLink,
          numberOfPages,
          theme,
          category,
          org,
          searchQuery,
          paginationLinks,
        });
      }
    );
  });
};

// Helper function to fetch dropdowns and render the page
function fetchDropdownsAndRender(resp, renderData) {
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
            ...renderData,
            themeResult,
            categoryResult,
            orgResult,
            countResult,
          });
        });
      });
    });
  });
}
