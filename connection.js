const mysql = require('mysql');
require('dotenv').config();

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