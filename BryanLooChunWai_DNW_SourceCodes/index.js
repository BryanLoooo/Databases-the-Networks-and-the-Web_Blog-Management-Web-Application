
//import the modules
const express = require('express');
const session = require('express-session');
var bodyParser = require("body-parser");
const ejs = require('ejs');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

//set up expression session variables
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// set the app to use ejs for rendering
app.set('view engine', 'ejs');

// set location of static files
app.use(express.static(__dirname + '/public'));


// Set up SQLite section
// Items in the global namespace are accessible throught out the node application
const sqlite3 = require('sqlite3').verbose();

global.db = new sqlite3.Database('./database.db',function(err){

    if(err){
        console.error(err);
        process.exit(1); // bail out we can't connect to the DB

    } else {
        
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
    }
});

//set up the first route for the localhost
app.get("/", (req, res) => {

    res.render("main-homepage.ejs");
});

// Add all the route handlers in usersRoutes to the app under the path /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);


// Make the web application listen for HTTP requests
app.listen(port, () => {

    console.log(`Example app listening on port ${port}`)
})

