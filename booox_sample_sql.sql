INSERT INTO users (name, last_name, email ) VALUES ( 'Umit', 'Oner', 'umitao@hotmail.com' );
INSERT INTO users (name, last_name, email ) VALUES ( 'Roshan', 'Sapkota', 'roshan@hotmail.com' );
INSERT INTO users (name, last_name, email ) VALUES ( 'Lavinia', 'Loredana', 'lavinia@hotmail.com' );
INSERT INTO users (name, last_name, email ) VALUES ( 'Amadou', 'Saidy', 'amadou@hotmail.com' );
INSERT INTO users (name, last_name, email ) VALUES ( 'Eduard', 'Bargues', 'eduard@hotmail.com' );

INSERT INTO books (isbn, title, author, publisher, published_date, subtitle, language) VALUES ( '1234567891011', 'The Elegant Universe', 'Brian Greene', 'Cambridge', '2008-09-25', 'A tour inside our universe', 'English' );
INSERT INTO books (isbn, title, author, publisher, published_date, subtitle, language) VALUES ( '1234567891012', 'The Road to Learn React', 'Robin Wieruch', 'Freedom Press', '2018-06-24', 'Learn React by doing', 'English' );
INSERT INTO books (isbn, title, author, publisher, published_date, subtitle, language) VALUES ( '1234567891013', '30-second Biology', 'Brian Greene', 'Cambridge', '2008-09-25', 'A tour inside our universe', 'English' );

INSERT INTO books (isbn, title, author, publisher, published_date, subtitle, language) VALUES ( '1234567891019', 'New Book2', 'New Author2', 'Cambridge', '2008-09-25', 'A tour inside our universe', 'English' ) RETURNING id;

INSERT INTO tags (tag) VALUES ( 'physics' );
INSERT INTO tags (tag) VALUES ( 'science' );
INSERT INTO tags (tag) VALUES ( 'computers' );
INSERT INTO tags (tag) VALUES ( 'math' );