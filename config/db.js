const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "shsgv1.simplehost.sg",
  user: "ostendoa_ticketing",
  password: process.env.DB_SECRET,
  database: "ostendoa_ticketing",
});

module.exports = pool;
