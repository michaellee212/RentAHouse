var dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
var app = express();
var House = require("./models/house");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var seedDB = require("./seeds");
var Comment = require("./models/comment");
var User = require("./models/user");
var methodOverride = require("method-override");
var flash = require("connect-flash");

const port = process.env.PORT || 3000;


// Removes any script tags in the body
// const expressSanitizer = require('express-sanitizer');
// app.use(expressSanitizer());


// Requiring ROUTES
var commentRoutes = require("./routes/comments");
var reviewRoutes = require("./routes/reviews");
var houseRoutes = require("./routes/houses");
var indexRoutes = require("./routes/index");


// mongoose.connect("mongodb://localhost:27017/rent_a_house", {
//     useNewUrlParser: true
// });


// HEROKU SETUP
mongoose.connect('mongodb+srv://michaelee212:fRIxj2c8oi2CAAHc@cluster-qryvj.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log('Connected to DB!');
}).catch(err => {
    console.log('ERROR:', err.message);
});


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash()); // flash updates
// seedDB(); // seed the database
app.locals.moment = require("moment");


// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Miguel's Secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// passport-local-mongoose config
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// currentUser
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/houses", houseRoutes);
app.use("/houses/:id/reviews", reviewRoutes);
app.use("/houses/:id/comments", commentRoutes);


// Express listens for requests (Start server)
app.listen(port, () => console.log(`RentAHouse starting on port ${port}!`))