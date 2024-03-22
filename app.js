var express = require('express');
var path = require('path');
var dotenv = require('dotenv');
var mysql = require('mysql2');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

dotenv.config();
app.use(bodyParser.urlencoded({extended: false}))

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database ' + err.stack);
        return;
    }
    console.log('Connected to the database as ID ' + connection.threadId);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {title : 'Log In', email: req.body.email, password: req.body.password});
    console.log(req.query.password);
    connection.query('SELECT * FROM user', (err, rows, fields) => {
        if (err) throw err
        console.log(rows)
    });
});

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

module.exports = app;
