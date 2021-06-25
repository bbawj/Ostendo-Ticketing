const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_SECRET,
  database: "ostendoticketing",
});

module.exports = pool;
