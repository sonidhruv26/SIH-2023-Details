const mysql = require('mysql');

const port = process.env.PORT || 4000; // Use 4000 if PORT is not defined
const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'defaultUser';
const dbPassword = process.env.DB_PASSWORD || 'defaultPassword';

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'defaultUser',
    password: process.env.DB_PASSWORD || 'defaultPassword',
    database: 'sih'
});

db.connect(err => {
    if(err) throw err;
    console.log("Connected to MySQL");
});

module.exports = db;