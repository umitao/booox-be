const jwt = require("jsonwebtoken");
const { idleCount } = require("../db");
require("dotenv").config();

function jwtGenerator(user_id) {
  const payload = {
    user: {
      id: user_id,
    },
  };
  return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "2hr" });
}

module.exports = jwtGenerator;
