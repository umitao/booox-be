const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require("bcrypt");
app.use(cors());
const pool = require("./db");
const authorization = require("./middleware/authorization");
const jwt = require("jsonwebtoken");
const { checkout } = require("./routes/jwtAuth");
require("dotenv").config();
const tsquery = require("pg-tsquery")(/* options can be passed to override the defaults */);

// READ BODIES AND URL FROM REQUESTS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// LOG ALL REQUESTS
app.use(morgan("dev"));

//REGISTER & LOGIN ROUTES

app.use("/auth", require("./routes/jwtAuth"));

app.use("/profile", require("./routes/profile"));

//ADD A BOOK
app.post("/book", function (req, res) {
  const jwtToken = req.header("token");
  const payload = jwt.verify(jwtToken, process.env.jwtSecret);
  req.user = payload.user;

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
    "WITH insertbook AS (INSERT INTO books (isbn, title, author, publisher, published_date, subtitle,language) VALUES ( $1, $2, $3, $4, $5, $6, $7 ) RETURNING id) INSERT INTO users_vs_books (users_id, books_id) VALUES ($8,(SELECT * FROM insertbook)) RETURNING users_id, books_id";

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
        // console.log(error);
        res.status(500).send("Something went wrong :( ...");
      }
    });
});

//EDIT BOOK INFO
app.put("/bookupdate:bookId", authorization, function (req, res) {
  const { bookId } = req.params;
  const { title, author, publisher, subtitle, language } = req.body;

  console.log(req.fields);

  let query =
    "UPDATE books SET title = $1, author = $2, publisher = $3, subtitle = $4, language = $5 WHERE id = $6;";

  pool.query(query, [title, author, publisher, subtitle, language, bookId]);
});

//DELETE A BOOK
app.delete("/delete", function (req, res) {
  const { q } = req.query;

  let query =
    "WITH deletebook AS (DELETE FROM users_vs_books uvb WHERE books_id = $1 RETURNING books_id) DELETE FROM books b WHERE id = (SELECT * FROM deletebook);";

  pool
    .query(query, [q])
    .then((result) => res.status(200).send(`Book with ID=${q} deleted`))
    .catch((error) => {
      console.log(error);
      res.status(500).send("Something went wrong :( ...");
    });
});

//SEARCHING WITH TSQUERY - INDEXING & TRIGGERS LACKING ON DB
app.get("/search", function (req, res) {
  const { q: searchTerm } = req.query;

  let query =
    "SELECT * FROM books WHERE title_tokens || author_tokens || language_tokens @@ to_tsquery($1);";

  pool
    .query(query, [tsquery(searchTerm)])
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

//GET ALL BOOKS
app.get("/books", function (req, res) {
  let query = "SELECT * FROM books";

  pool
    .query(query)
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

//PROFILE PAGE - USE /profile IMPORTED AT TOP
// app.get("/userpage", authorization, function (req, res) {
//   const { id } = req.user;
//   let query = "SELECT name FROM users WHERE id = $1";

//   pool
//     .query(query, [id])
//     .then((result) => res.json(result.rows[0]))
//     .catch((err) => console.error(err));
// });

//GET BOOKS OF A USER
app.get("/:id/books", function (req, res) {
  const { id } = req.params;

  let query =
    "SELECT * FROM books b JOIN users_vs_books uvb ON b.id = uvb.books_id WHERE uvb.users_id = $1;";

  pool
    .query(query, [id])
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

//SINGLE BOOK PAGE QUERY
app.get("/book", function (req, res) {
  const bookId = req.query.q;
  let query = "SELECT * FROM books WHERE id = $1";

  pool
    .query(query, [bookId])
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

// REQUEST BOOK
app.post("/requestbook", authorization, (req, res) => {
  console.log(req.user);
  const { id: user } = req.user;
  const { book } = req.query;

  let query =
    "WITH insbook AS ( SELECT (users_id) FROM users_vs_books uvb WHERE books_id = $2)INSERT INTO book_requests (requesting_user_id, book_id, owner_id) VALUES ($1, $2, (SELECT * FROM insbook))";

  pool
    .query(query, [user, book])
    .then((result) => res.json(result.rows[0]))
    .catch((err) => {
      if (err.code === "23503") {
        res.status(400).send("Book does not exist.");
      } else if (err.code === "23502") {
        res.status(400).send("No user has this book.");
      } else if (err.code === "23514") {
        res.status(400).send("You cannot request a book you own!");
      } else {
        console.error(err);
      }
    });

  //Owner book and req.user
  //Return date & status
});

// //LIST MY REQUESTED BOOKS & TAKEN BOOKS
// app.get("/app/req")

app.listen(3001, function () {
  console.log("Server is listening on port 3001. Ready to accept requests!");
});
