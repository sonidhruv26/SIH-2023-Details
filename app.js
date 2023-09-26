const express = require("express");
const app = express();
const mysql = require("./connection");
require('dotenv').config();
const port = process.env.PORT || 80;

app.set('view engine', 'ejs');
app.set("views","./Views");
app.use(express.static(__dirname+"/Public"));

// Rest of your code, including routes
// How many problems we want to show on each page
const resultsPerPage = 10;

app.get("/", (req, resp) => {
    let viewAll = "Select * from sih_details";
    mysql.query(viewAll, (err, result) => {
        // Rest of your route logic
        if (err) throw err;
        // console.log(result);
        const numOfResults = result.length;
        const numberOfPages = Math.ceil(numOfResults / resultsPerPage);

        let page = req.query.page ? Number(req.query.page) : 1;
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
            let endingLink = iterator + 4 <= numberOfPages ? iterator + 4 : numberOfPages;
            if (endingLink < page + 2) {
                iterator -= page + 2 - numberOfPages;
            }
            resp.render("index", {
                data: result,
                page,
                iterator,
                endingLink,
                numberOfPages,
            });
        });
        // resp.render('index', { data: result, page, iterator, endingLink, numberOfPages });
    });
});

app.listen(process.env.PORT || port, () => {
    console.log(`Listening on port ${port}`);
});
