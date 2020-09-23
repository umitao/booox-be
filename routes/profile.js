const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.get("/", authorization, async (req, res) => {
  try {
    //payload
    //res.json(req.user);
    const user = await pool.query("SELECT name FROM users WHERE id = $1", [
      req.user.id,
    ]);
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json("Server Error");
  }
});

module.exports = router;
