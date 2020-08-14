const express = require("express");
const app = express();
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booox",
  password: "",
  port: 5432,
});

app.post("/book", function (req, res) {
  let {
    newBookIsbn,
    newBookTitle,
    newBookAuthor,
    newBookPublisher,
    newBookPublishedDate,
    newBookSubtitle,
    newBookLanguage,
  } = req.body;

  let query =
    "INSERT INTO books (isbn, title, author, publisher, published_date, subtitle, language) VALUES ($1, $2, $3, $4, $5, $6, $7 )";

  pool
    .query(query, [
      newBookIsbn,
      newBookTitle,
      newBookAuthor,
      newBookPublisher,
      newBookPublishedDate,
      newBookSubtitle,
      newBookLanguage,
    ])
    .then((result) => res.status(201).send("New Book Added!"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("Something went wrong :( ...");
    });
});

app.listen(3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});
