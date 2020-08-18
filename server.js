const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { Pool } = require("pg");
const morgan = require("morgan");
const cors = require("cors");
app.use(cors());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booox",
  password: "roshansapkota1",
  port: 5432,
});

// READ BODIES AND URL FROM REQUESTS
app.use(bodyParser.json());
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
    "INSERT INTO books (isbn, title, author, publisher, published_date, subtitle, language) VALUES ($1, $2, $3, $4, $5, $6, $7 )";

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
    .then((result) => res.status(201).send("New Book Added!"))
    .catch((error) => {
      console.log(error);
      res.status(500).send("Something went wrong :( ...");
    });
});

app.post("/userinfo", (req, res) => {
  let query = 'insert into users (name, last_name, email) values($1, $2, $3)';

  const {firstName, lastName, email} = req.body;

  pool.query(query, [firstName, lastName, email])
  .then(result => res.status(201).send("New User Added"))
  .catch((error) => {
    console.log(error);
    res.status(500).send("Something went wrong :( ...");
  });

})



app.get('/users', function (req, res){
  pool.query('select * from users;')
  .then (result => res.status(201).send(result.rows))
})


app.listen(3000, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});
