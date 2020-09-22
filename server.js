const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require("bcrypt");
app.use(cors());
const pool = require("./db");

// READ BODIES AND URL FROM REQUESTS
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// LOG ALL REQUESTS
app.use(morgan("dev"));

//Register & Login Routes

app.use("/auth", require("./routes/jwtAuth"));

//userprofile dashboard 
app.use("/userpage", require("./routes/userpage"));

app.use("/bookupload",  require("./routes/userpage"));



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
    .then((result) => res.status(201).send(result.rows[0]))
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
  const searchTerm = req.query.q;
  const regexSearch = searchTerm.replace(/\b\s/g, ":* | " + ":*");
 
  
  let query =
    "SELECT * FROM books WHERE title_tokens || author_tokens || language_tokens @@ to_tsquery($1);";

  pool
    .query(query, [regexSearch])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});

//send all books 
app.get("/filterwithid", function (req, res) {
  const searchTerm = req.query.q;
 let query =
    "SELECT * FROM books where id = $1 ";

  pool
    .query(query, [searchTerm])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});



app.delete("/delete", function (req, res) {
  //const { searchTerm } = req.body;
  const deleteTerm = req.query.q;

  let query ='delete from books where books.id = $1;'

  pool
    .query(query, [deleteTerm])
    .then((result) => res.status(200).json(result.rows[0]))
    .catch((e) => console.error(e));
});

app.get("/users", function (req, res) {
  const searchTerm = req.query.q;
  
  let query =
    "SELECT * from users where user user_email = $1";

  pool
    .query(query, [searchTerm])
    .then((result) => res.json(result.rows))
    .catch((e) => console.error(e));
});
//post on user vs books table
app.post("/usersvsbooks", function (req, res) {
 const {user_id, book_id} = req.body

  let query = "INSERT INTO users_vs_books (users_id, books_id) VALUES ($1, $2)";

  pool
    .query(query, [
      user_id,
      book_id
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

//getMyBooks for the usee page
app.get("/mybooks", function (req, res) {
  const user_id = req.query.q;
  
  let query =
    "select  b.* from users u join users_vs_books uvb on u.user_id = uvb.users_id join books b on b.id = uvb.books_id where u.user_id = $1"

  pool
    .query(query, [user_id])
    .then((result) => res.send(result.rows))
    .catch((e) => console.error(e));
});


//total number of books of a single user
app.get("/mytotalbooks", function (req, res) {
  const user_id = req.query.q;
  
  let query =
    "select  count(b.id) from users u join users_vs_books uvb on u.user_id = uvb.users_id join books b on b.id = uvb.books_id where u.user_id = $1"

  pool
    .query(query, [user_id])
    .then((result) => res.send(result.rows))
    .catch((e) => console.error(e));
});




app.listen(3001, function () {
  console.log("Server is listening on port 3001. Ready to accept requests!");
});


