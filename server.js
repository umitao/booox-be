const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
app.use(cors());
const pool = require("./db");
const authorization = require("./middleware/authorization");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// READ BODIES AND URL FROM REQUESTS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// LOG ALL REQUESTS
app.use(morgan("dev"));

//Register & Login Routes

app.use("/auth", require("./routes/jwtAuth"));

app.use("/profile", require("./routes/profile"));

//Add a book
app.post("/book", authorization, function (req, res) {
  const { id } = req.user;

  const {
    isbn,
    title,
    author,
    publisher,
    published_date,
    subtitle,
    language,
  } = req.body;

  let query =
    "WITH insbook AS (INSERT INTO books (isbn, title, author, publisher, published_date, subtitle,language) VALUES ( $1, $2, $3, $4, $5, $6, $7 ) RETURNING id) INSERT INTO users_vs_books (users_id, books_id) VALUES ($8,(SELECT * FROM insbook)) RETURNING users_id, books_id";

  pool
    .query(query, [
      isbn,
      title,
      author,
      publisher,
      published_date,
      subtitle,
      language,
      id,
    ])
    .then((result) => {
      res.status(201).json(result.rows[0]);
    })
    .catch((error) => {
      if (error.code === "23505") {
        res.status(400).send("Duplicate ISBN number");
      } else if (error.code === "22001") {
        res.status(400).send("ISBN Number is too long");
      } else {
        console.log(error);
        res.status(500).send("Something went wrong :( ...");
      }
    });
});

//Edit book info
app.put("/bookupdate:bookId", authorization, function (req, res) {
  const { bookId } = req.params;
  const { title, author, publisher, subtitle, language } = req.body;

  console.log(req.fields);

  let query =
    "UPDATE books SET title = $1, author = $2, publisher = $3, subtitle = $4, language = $5 WHERE id = $6;";

  pool.query(query, [title, author, publisher, subtitle, language, bookId]);
});

//Search engine with tsquery
app.get("/search", function (req, res) {
  const searchTerm = req.query.q;
  const regexSearch = searchTerm.replace(/\b\s/g, ":* | ") + ":*";

  let query =
    "SELECT * FROM books WHERE title_tokens || author_tokens || language_tokens @@ to_tsquery($1);";

  pool
    .query(query, [regexSearch])
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

//Profile page
app.get("/userpage", authorization, function (req, res) {
  const { id } = req.user;
  let query = "SELECT name FROM users WHERE id = $1";

  pool
    .query(query, [id])
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

//Get all books
app.get("/books", function (req, res) {
  let query = "SELECT * FROM books";

  pool
    .query(query)
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

app.get("/:id/books", authorization, function (req, res) {
  const { id } = req.params;
  let query =
    "select * from books b join users_vs_books uvb on b.id = uvb.books_id where uvb.users_id = $1;";

  pool
    .query(query, [id])
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

app.listen(3001, function () {
  console.log("Server is listening on port 3001. Ready to accept requests!");
});
