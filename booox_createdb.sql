drop table if exists users;
drop table if exists books;
drop table if exists users_vs_books;
drop table if exists tags;


CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name VARCHAR NOT NULL,
	last_name VARCHAR NOT NULL,
	email VARCHAR NOT NULL
);

CREATE TABLE books (
	id SERIAL PRIMARY KEY,
	isbn VARCHAR(13) UNIQUE, 
	title VARCHAR NOT NULL,
	author VARCHAR NOT NULL,
	publisher VARCHAR(50),
	published_date DATE,
	subtitle VARCHAR(120),
	language VARCHAR(30)
);

CREATE TABLE users_vs_books (
	users_id INT REFERENCES users(id),
	books_id INT REFERENCES books(id)
);

CREATE TABLE tags (
	id SERIAL PRIMARY KEY,
	tag VARCHAR UNIQUE
);

CREATE TABLE tags_vs_books (
	tags_id INT REFERENCES tags(id),
	books_id INT REFERENCES books(id)
);


