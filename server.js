require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const initializePassport = require("./config/passport-config");
const flash = require("express-flash");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const path = require("path");
const pool = require("./config/db");

initializePassport(
  passport,
  async (email) => {
    return await pool.query("SELECT * FROM users where email = ?", email);
  },
  async (id) => {
    return await pool.query("SELECT * FROM users where id = ?", id);
  }
);

const app = express();
const PORT = process.env.PORT || 5000;
const sessionStore = new MySQLStore(
  {
    host: "shsgv1.simplehost.sg",
    user: "ostendoa_ticketing",
    password: process.env.DB_SECRET,
    database: "ostendoa_ticketing",
  },
  pool
);

//middleware
app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
  })
);
app.use(express.json());
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, //1 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

//routes
const ticketRoute = require("./routes/ticket");
const commentRoute = require("./routes/comment");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const companyRoute = require("./routes/company");
app.use("/api/ticket", ticketRoute);
app.use("/api/comment", commentRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/company", companyRoute);

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
app.listen(PORT, () => {
  console.log("Server running on port:", PORT);
});
