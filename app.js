const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');

// Configure app
let port = 3000; 
let host = 'localhost';
app.set('view engine', 'ejs');

// MongoDB URI
const mongoURI = 'mongodb+srv://dgovind1:dgovind1@cluster0.zf0kh.mongodb.net/project5?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, host, () => {
            console.log('Server is running on port', port);
        });
    })
    .catch(err => console.log(err.message));


app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: mongoURI }),
        cookie: { maxAge: 60 * 60 * 1000 } 
    })
);

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});
// Routes
app.use('/items', itemRoutes);
app.use('/users', userRoutes);

// Landing page
app.get('/', (req, res) => {
    res.render('index');
});

// 404 Error Handling
app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});


app.use((err, req, res, next) => {
    console.log(err.stack);
    if (!err.status) {
        err.status = 500;
        err.message = "Internal server error";
    }
    res.status(err.status);
    res.render('error', { error: err });
});
