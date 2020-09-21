const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(user_id, user_name) {
  const payload = {
    user: {
      id: user_id,
      name: user_name,
    },
  };
  return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "2hr" });
}

module.exports = jwtGenerator;
