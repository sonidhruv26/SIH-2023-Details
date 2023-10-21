const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config();

const port = process.env.PORT; // Use 4000 if PORT is not defined
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    // ssl: { ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem") }
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

module.exports = db;