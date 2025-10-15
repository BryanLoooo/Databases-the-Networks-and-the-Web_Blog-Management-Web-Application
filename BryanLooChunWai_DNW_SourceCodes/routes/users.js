
//import modules
const { check, validationResult } = require('express-validator');
const express = require("express");
const router = express.Router();

//=======================================================
//Author methods

// Author home page route, brings user to author home page
router.get("/author", requireLogin, (req, res, next) => {

    const draft_query = "SELECT * FROM Articles WHERE publish_status = 'draft'";
    const published_query = "SELECT * FROM Articles WHERE publish_status = 'published'";
    const settingsQuery = 'SELECT blog_title FROM Settings WHERE author_id = ?';

    const user_query_parameters = [req.session.userId]; // Use userId from session

    global.db.all(published_query, (err, published_rows) => {
        if (err) {
            next(err);

        } else {
            global.db.all(draft_query, (err, draft_rows) => {
                if (err) {
                    next(err);
                } else {
                    global.db.get(settingsQuery, user_query_parameters, (err, settingsData) => {
                        if (err) {
                            next(err);
                        } else {
                        
                            res.render("author-homepage.ejs", { 
                                name: req.session.name,
                                publishedArticles: published_rows,
                                draftArticles: draft_rows,
                                blogTitle: settingsData ? settingsData.blog_title : '', // Extracting blog_title
                                usersID: req.session.userId
                            });
                        }});
            }});
    }});
});

// Delete an draft article from author page
router.delete("/delete-article/:article_id", (req, res, next) => {

    const query = "DELETE FROM Articles WHERE article_id = ? AND publish_status = 'draft'";
    const query_parameters = [req.params.article_id];

    global.db.run(query, query_parameters, (err) => {
        if (err) {
            console.error('Error deleting draft article:', err);
            return res.status(500).send('Failed to delete article');
            next();
        }

        res.sendStatus(204); // Send success status with no content
    });
});

//delete a published article from author page
router.delete("/delete-published-article/:article_id", (req, res, next) => {

    const query = "DELETE FROM Articles WHERE article_id = ? AND publish_status = 'published'";
    const query_parameters = [req.params.article_id];

    global.db.run(query, query_parameters, (err) => {
        if (err) {
            console.error('Error deleting published article:', err);
            return res.status(500).send('Failed to delete article');
        }

        res.sendStatus(204); // Send success status with no content
    });
});

//delete a draft article
router.delete("/delete-draft/:article_id", (req, res, next) => {

    const query = "DELETE FROM Articles WHERE article_id = ?";
    const query_parameters = [req.params.article_id];

    global.db.run(query, query_parameters, (err) => {
        if (err) {
            console.error('Error deleting article:', err);
            return res.status(500).send('Failed to delete article');
        }

        res.sendStatus(204); // Send success status with no content
    });
});

// Publish a draft article from author page
router.post("/publish-draft/:article_id", (req, res, next) => {

    const query = "UPDATE Articles SET publish_status = 'published', published_at = CURRENT_TIMESTAMP WHERE article_id = ?";
    const query_parameters = [req.params.article_id];

    global.db.run(query, query_parameters, (err) => {
        if (err) {
            next(err);

        } else {
            res.redirect('/users/author');
        }
    });
});

//edit draft article from author page
router.get("/edit-page/:title", requireLogin, (req, res, next) => {

    const query = "SELECT * FROM Articles WHERE article_title = ?";
    const query_parameters = [req.params.title];

    global.db.get(query, query_parameters, (err, article) => {
        if (err) {
            console.error('Database Error:', err);
            next(err);
        } else {

            if (!article) {
                return res.status(404).send('Article not found');
            }

            res.render("edit-page.ejs", { article }); // Pass the article object to the view
        }
    });
});

// Handle the form submission for editing a draft article and updates with the new values
router.post("/edit-page/:article_title", (req, res, next) => {

    const { article_title, content } = req.body;
    const query = "UPDATE Articles SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE article_title = ?";
    const query_parameters = [content, article_title];

    global.db.run(query, query_parameters, (err) => {
        if (err) {
            next(err);

        } else {
            res.redirect("/users/author");
        }
    });
});

//render the new article page for author
router.get("/new-article", (req, res) => {

    res.render("add-article.ejs");
});

//create a new draft article and insert the new article into articles table with the initial publish_status as draft
router.post("/new-article", (req, res, next) => {

    const { article_title, content } = req.body;
    const user_query_parameters = [req.session.userId];
    const query = "INSERT INTO Articles (article_title, content, publish_status, author_id) VALUES (?, ?, 'draft', ?)";
    const query_parameters = [article_title, content, user_query_parameters];

    global.db.run(query, query_parameters, function (err) {
        if (err) {
            next(err);
            console.log("Could not add new draft article");

        } else {
            res.redirect('/users/author');
        }
    });
});

//route to render the settings page with the form and current user settings displayed
router.get("/settings", requireLogin, (req, res, next) => {

    const author_id = req.session.userId; // Assuming the author's ID is stored in session

    if (!author_id) {
        console.error('Author ID not found in session');
        return res.status(500).send('Internal server error');
    }

    const query = "SELECT blog_title, author_name FROM Settings WHERE author_id = ?";
    const query_parameters = [author_id];

    global.db.get(query, query_parameters, (err, settings) => {
        if (err) {
            console.error('Database Error:', err);
            next(err);
        } else {
            if (!settings) {
                return res.status(404).send('Settings not found');
            }

            res.render("settings.ejs", {
                currentBlogTitle: settings.blog_title,
                currentAuthorName: settings.author_name
            });
        }});
});

//update author settings with the new inserted values
router.post("/update-settings", requireLogin, (req, res, next) => {

    const { blog_title } = req.body;
    const author_id = req.session.userId; // Assuming the author's ID is stored in session

    if (!author_id) {
        console.error('Author ID not found in session');
        return res.status(500).send('Internal server error');
    }

    const updateQuery = "UPDATE Settings SET blog_title = ? WHERE author_id = ?";
    const draft_query = "SELECT * FROM Articles WHERE publish_status = 'draft'";
    const published_query = "SELECT * FROM Articles WHERE publish_status = 'published'";
    const query_parameters = [blog_title, author_id];

    global.db.run(updateQuery, query_parameters, (err) => {
        if (err) {
            console.error('Database Error:', err);
            next(err);

        } else {

            // Retrieve the updated settings after update
            const selectQuery = "SELECT blog_title, author_name FROM Settings WHERE author_id = ?";
            global.db.get(selectQuery, [author_id], (err, settings) => {
                if (err) {
                    console.error('Database Error:', err);
                    next(err);
                } else {
                    global.db.all(published_query, (err, published_rows) => {
                        if (err) {
                            next(err);
                        } else {
                            global.db.all(draft_query, (err, draft_rows) => {
                                if (err) {
                                    next(err);
                                } else {
                                    res.render("author-homepage.ejs", {
                                        name: req.session.name,
                                        blogTitle: settings.blog_title,
                                        publishedArticles: published_rows,
                                        draftArticles: draft_rows
                                    });
                                }});
                        }});
                }});
    }});
});

//End author methods
//=======================================================
//=======================================================
//reader methods

//view articles page for reader
router.get("/article-page", (req, res, next) => {

    const sqlquery = "SELECT * FROM Articles";

    global.db.all(sqlquery, (err, rows) => {
        if (err) {
            next(err);

        } else {
            res.render("article-page.ejs", { availableArticles: rows });
        }
    });
});

//reader home page brings user to the reader home page
router.get('/reader', requireLogin, (req, res, next) => {

    const published_query = "SELECT * FROM Articles WHERE publish_status = 'published'";
    const blog_query = "SELECT blog_title FROM Settings WHERE author_name = 'Bryan'";
    const author_name_query = "SELECT author_name FROM Settings WHERE author_name = 'Bryan'";

    global.db.all(published_query, (err, published_rows) => {
        if (err) {
            return next(err);
        }
        global.db.all(blog_query, (err, blogTitleRows) => {
            if (err) {
                return next(err);
            }

            if (blogTitleRows.length === 0) {
                return res.status(404).send('Blog title not found');
            }

            const blog_title = blogTitleRows[0].blog_title;

            global.db.all(author_name_query, (err, authorRows) => {
                if (err) {
                    return next(err);
                }

                if (authorRows.length === 0) {
                    return res.status(404).send('Author not found');
                }

                const author_name = authorRows[0].author_name;

                res.render("reader-homepage.ejs", {
                    name: req.session.name,
                    publishedArticles: published_rows,
                    blog_title: blog_title,
                    author_name: author_name
                });
            });
        });
    });
});

//fetch article and comments with the particular article id and increases the number of reads by 1
router.get('/view', (req, res, next) => {

    const articleId = req.query.id
    const articleQuery = "SELECT * FROM Articles WHERE article_id = ?";
    const commentsQuery = "SELECT * FROM Comments WHERE article_id = ? ORDER BY comment_created_at DESC";
    const updateLikesQuery = "UPDATE Articles SET reads = reads + 1 WHERE article_id = ?";

    global.db.get(articleQuery, [articleId], (err, article) => {
        if (err) {
            return next(err);
        }

        if (!article) {
            return res.status(404).send('Article not found');
        }

        global.db.all(commentsQuery, [articleId], (err, comments) => {
            if (err) {
                return next(err);

            }else{
                global.db.run(updateLikesQuery, [articleId], function(err) {
                    if (err) {
                        return next(err);
                    }else{

            res.render('article-page.ejs', {
                article: article,
                comments: comments,
                readerName: req.session.name
            });
        }});
    }});
});
});

//handle like button and updates the number of likes by 1 when the user presses on the like button
router.post('/like', (req, res, next) => {

    const articleId = req.body.id
    const updateLikesQuery = "UPDATE Articles SET likes = likes + 1 WHERE article_id = ?";

    global.db.run(updateLikesQuery, [articleId], function(err) {
        if (err) {
            return next(err);
        }

        res.redirect('/users/reader');
    });
});

//handle comment submission and inserts the new comment after the user clicks on submit comment button
router.post('/comment', (req, res, next) => {

    const { article_id, commenter, comment } = req.body;
    const insertCommentQuery = "INSERT INTO Comments (author_name, comment_content, article_id) VALUES (?, ?, ?)";

    global.db.run(insertCommentQuery, [commenter, comment, article_id], function(err) {
        if (err) {
            return next(err);
        }

        res.redirect('/users/reader');
    });
});

//end reader methods
//=======================================================
//=======================================================
//login and register methods

//middleware to check if user is logged in
function requireLogin(req, res, next) {

    if (req.session.name) {
        next(); // User authenticated

    } else {
        res.redirect('/author/login'); // Redirect to login page if not authenticated
    }
}

//registration for authors and readers
router.get("/register", (req, res) => {

    res.render("register.ejs");
});

//registration and checks for input validation using express validator referenced by the word check
router.post('/register', [
    check('name', 'Name is required').notEmpty(),
        check('email', 'Email is required').notEmpty().isEmail(),
        check('password', 'Password is required').notEmpty(),
        check('age', 'Age is required and must be between 1 and 109').notEmpty().isInt({ min: 1, max: 109 }),
        check('role', 'Invalid role selected').notEmpty().isIn(['author', 'reader']),
        check('email', 'Email length should be 10 to 30 characters').isEmail().isLength({ min: 10, max: 30 }),
        check('name', 'Name length should be 5 to 20 characters').isLength({ min: 5, max: 20 }),
        check('password', 'Password length should be 5 to 20 characters').isLength({ min: 5, max: 20 }),
], (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('register.ejs', { error: errors.array() });
    }

    const { name, email, password, age, role } = req.body;

    const existingUserQuery = role === 'author' 
      ? 'SELECT email FROM Authors WHERE email =?'
        : 'SELECT email FROM Readers WHERE email =?';

    const existingUserQuery_parameters = [email];

    global.db.get(existingUserQuery, existingUserQuery_parameters, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error checking existing user.');
        }

        if (user) {
            return res.render('register.ejs', { errorUser: 'Author or reader already exists. Please try again!' });
        }

        const insertUserQuery = role === 'author'
          ? 'INSERT INTO Authors (name, email, password, age) VALUES (?,?,?,?)'
            : 'INSERT INTO Readers (name, email, password, age) VALUES (?,?,?,?)';

        const insertUserParams = [name, email, password, age];

        global.db.run(insertUserQuery, insertUserParams, function(err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error registering user!');
            }

            // Get the newly inserted user's ID
            const userId = this.lastID;

            if (role === 'author') {

                // Insert default settings for the new author
                const defaultSettingsQuery = 'INSERT INTO Settings (blog_title, author_name, author_id) VALUES (?,?,?)';
                const defaultSettingsParams = ['My Blog', name, userId];

                global.db.run(defaultSettingsQuery, defaultSettingsParams, function(err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error inserting default settings!');
                    }
                    console.log("Inserted default settings successfully!");
                    res.redirect(`/`);
                });
            } else {

                // For readers, no settings insertion is needed
                console.log("Reader registration successful!");
                res.redirect(`/`);
            }});
        });
});

//author login brings user to login as an author
router.get('/author/login', (req, res) => {

    res.render("author-login.ejs");
});

//author login verification, verifies if the author exists in the table
router.post('/author/login', (req, res) => {

    const { name, password } = req.body;
    const query = 'SELECT author_id FROM Authors WHERE name = ? AND password = ?'; // Adjusted query to select only author_id
    const query_parameters = [name, password];

    global.db.get(query, query_parameters, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging in.');

        }
        if (!user) {

            return res.render('author-login.ejs', { error: 'Author does not exist. Please try again!' });
        }

        console.log("Session has started");
        req.session.name = name;
        req.session.userId = user.author_id; // Store user ID

        res.redirect('/users/author'); // Redirect to a protected route
    });
});

//reader login, brings reader to login as a reader
router.get('/reader/login', (req, res) => {

    res.render("reader-login.ejs");
});

//reader login verification, validates if the reader exists in the table
router.post('/reader/login', (req, res) => {

    const { name, password } = req.body;
    const query = 'SELECT * FROM Readers WHERE name = ? AND password = ?';
    const query_parameters = [name, password];

    global.db.get(query, query_parameters, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error logging in.');

        }
        if (!user) {

            return res.render('reader-login.ejs', { error: 'Reader does not exist. Please try again!' });
        }

        console.log("Session has started");
        req.session.name = name;
        req.session.userId = user.id; // Store user ID or other relevant data

        res.redirect('/users/reader'); // Redirect to a protected route
    });
});
//end login and register methods
//=======================================================
//logout methods

//author logout, ends the session for the particular author when the author clicks on log out button
router.get('/author/logout', (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            console.log("Session failed to end!");
            return res.status(500).send('Error ending session.');
        }

        console.log("Session ended");
        res.redirect('/');
    });
});

//reader logout, ends the session for the particular reader when the reader clicks on log out button
router.get('/reader/logout', (req, res) => {

    req.session.destroy((err) => {
        if (err) {
            console.log("Session failed to end!");
            return res.status(500).send('Error ending session.');
        }

        console.log("Session ended");
        res.redirect('/');
    });
});

//end of logout methods
//=======================================================

//export the router module with the relevant methods 
module.exports = router;
