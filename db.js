const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booox",
  password: "roshansapkota1",
  port: 5432,
});

module.exports = pool;
