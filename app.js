if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongo");
const passport = require('passport')
const LocalStrategy = require('passport-local')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')

const User = require('./models/user')
const { isLoggedIn } = require('./middleware/auth')
const userRoutes = require('./routes/users')
const todoRoutes = require("./routes/todos");
const ExpressError = require("./utils/ExpressError");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/express-todos";

const mongoOptions = {
  authSource: "admin",
  user: process.env.MONGO_INITDB_ROOT_USERNAME,
  pass: process.env.MONGO_INITDB_ROOT_PASSWORD,
};

mongoose.connect(dbUrl, mongoOptions).catch((error) => console.log(error));
const db = mongoose.connection;
db.on("error", (err) => console.log(err));
db.once("open", () => console.log("Database connected"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
  replaceWith: '_'
}))

const secret = process.env.SECRET;

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  mongoOptions: {
    authSource: "admin",
    auth: {
      username: process.env.MONGO_INITDB_ROOT_USERNAME,
      password: process.env.MONGO_INITDB_ROOT_PASSWORD
    }
  },
  touchAfter: 24 * 3600,
  crypto: {
    secret,
  },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store: store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

app.use('/', userRoutes)
app.get("/", isLoggedIn, (req, res) => res.render("home"));
app.use("/todos", isLoggedIn, todoRoutes);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = `Oh No, Something Went Wrong!`;
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, (req, res) => {
  console.log(`Serving on port ${port}`);
});
