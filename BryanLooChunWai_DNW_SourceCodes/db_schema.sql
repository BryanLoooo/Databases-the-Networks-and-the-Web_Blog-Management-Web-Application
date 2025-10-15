
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create Authors Table
CREATE TABLE IF NOT EXISTS Authors (
    author_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(20) NOT NULL,
    age INT,
    blog_title VARCHAR(255)
);

-- Create Readers Table
CREATE TABLE IF NOT EXISTS Readers (
    reader_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(20) NOT NULL,
    age INT
);

-- Create Articles Table
CREATE TABLE IF NOT EXISTS Articles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    publish_status TEXT CHECK (publish_status IN('draft', 'published')) DEFAULT 'draft',
    reads INT DEFAULT 0,
    likes INT DEFAULT 0,
    author_id INTEGER,
    FOREIGN KEY(author_id) REFERENCES Authors(author_id)
);

-- Create Comments Table
CREATE TABLE IF NOT EXISTS Comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name VARCHAR (100) NOT NULL,
    comment_content TEXT NOT NULL,
    comment_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    article_id INTEGER,
    reader_id INTEGER,
    FOREIGN KEY(article_id) REFERENCES Articles(article_id),
    FOREIGN KEY(reader_id) REFERENCES Readers(reader_id)
);

-- Create Settings Table
CREATE TABLE IF NOT EXISTS Settings (
    setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_title VARCHAR(255) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_id INTEGER,
    FOREIGN KEY(author_id) REFERENCES Authors(author_id)
);

--Create Sample Authors
INSERT INTO Authors (name, email, password, age, blog_title) VALUES ('John Doe', 'john.doe@example.com', 'password123', 30, 'Johns Blog');
INSERT INTO Authors (name, email, password, age, blog_title) VALUES ('Jane Smith', 'jane.smith@example.com', 'securepass', 28, 'Janes Travel Diaries');
INSERT INTO Authors (name, email, password, age, blog_title) VALUES ('Bryan', 'Bryan@gmail.com', 'password', 20, 'Bryan New Blog');

--Create Sample Readers
INSERT INTO Readers (name, email, password, age) VALUES ('Alice Johnson', 'alice.johnson@example.com', 'alicepass', 25);
INSERT INTO Readers (name, email, password, age) VALUES ('Bob Brown', 'bob.brown@example.com', 'bobpass123', 32);

--Create Sample settings for the existing authors
INSERT INTO Settings (blog_title, author_name, author_id) VALUES ('Johns Tech Blog', 'John Doe', 1);
INSERT INTO Settings (blog_title, author_name, author_id) VALUES ('Janes Travel Diaries', 'Jane Smith', 2);
INSERT INTO Settings (blog_title, author_name, author_id) VALUES ('Bryan Blog', 'Bryan', 3);

COMMIT;

