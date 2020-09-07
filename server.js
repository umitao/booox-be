const express = require("express");
const app = express();
const { Pool } = require("pg");
const morgan = require("morgan");
const cors = require("cors");
app.use(cors());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booox",
  password: "",
  port: 5432,
});

// READ BODIES AND URL FROM REQUESTS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// LOG ALL REQUESTS
app.use(morgan("tiny"));

app.post("/book", function (req, res) {
  const {
    isbn,
    title,
    author,
    publisher,
    published_date,
    subtitle,
    language,
  } = req.body;

  console.log(req.body);

  let query =
    "INSERT INTO books (isbn, title, author, publisher, published_date, subtitle, language) VALUES ($1, $2, $3, $4, $5, $6, $7 ) RETURNING id";

  pool
    .query(query, [
      isbn,
      title,
      author,
      publisher,
      published_date,
      subtitle,
      language,
    ])
    .then((result) => res.status(201).json(result.rows[0]))
    .catch((error) => {
      if (error.code === "23505") {
        res.status(400).send("Duplicate ISBN number");
      } else {
        console.log(error);
        res.status(500).send("Something went wrong :( ...");
      }
    });
});

//GET method to access DB and return results
app.get("/search", function (req, res) {
  const { searchTerm } = req.body;
  console.log(searchTerm);

  let query =
    "SELECT * FROM books WHERE title_tokens || author_tokens || language_tokens @@ plainto_tsquery($1);";

  pool
    .query(query, [searchTerm])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

app.listen(3001, function () {
  console.log("Server is listening on port 3001. Ready to accept requests!");
});
