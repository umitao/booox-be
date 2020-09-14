const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { Pool } = require("pg");
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require("bcrypt");
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
  //const { searchTerm } = req.body;
  const searchTerm = req.query.q;


  const regexSearch = searchTerm.replace(/\b\s/g, ":* | ") + ":*";
 
  
  let query =
    "SELECT * FROM books WHERE title_tokens || author_tokens || language_tokens @@ to_tsquery($1);";

  pool
    .query(query, [regexSearch])
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

//registering 401 for unauthorised and 403 for unauthenticated
app.post("/register", async(req, res) => {
  try {
      //1.destructure the req.body

      const {name, email, password } = req.body;

      //2.check if the user exists (if exists then throw the error)

      const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

      if(user.rows.length !== 0) {
        return res.status(401).send("user already exists");
      }

      //3. Bycript the user password

      const saltRound = 10;
      const salt =  await bcrypt.genSalt(saltRound);
      const bcryptPassword = await bcrypt.hash(password, salt);

      //4. enter the new user inside our database

      const newUser = await pool.query("INSERT INTO users (user_name, user_email, user_password) values ($1, $2, $3) returning *", [name, email, bcryptPassword]);
      res.json(newUser.rows[0]);
      res.send("new user added");
  } catch (err) {
    console.error(error.message);
    res.status(500).send("server error");
    
  }
})



app.listen(3001, function () {
  console.log("Server is listening on port 3001. Ready to accept requests!");
});


