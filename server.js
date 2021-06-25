if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const pool = require("./db");

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
    host: "localhost",
    user: "root",
    password: process.env.DB_SECRET,
    database: "ostendoticketing",
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
    store: sessionStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//routes
const ticketRoute = require("./routes/ticket");
const commentRoute = require("./routes/comment");
app.use("/api/ticket", ticketRoute);
app.use("/api/comment", commentRoute);

app.post("/register", async (req, res) => {
  try {
    //check if email already registered
    const [rows, fields] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [req.body.email]
    );
    if (rows.length !== 0)
      return res.status(404).send({ message: "User already registered" });
    //create user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = { email: req.body.email, password: hashedPassword };
    await pool.query("INSERT INTO users SET ?", newUser);
    return res.status(200).json({ redirectUrl: "/home" });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
});

app.post("/login", passport.authenticate("local"), (req, res) => {
  return res.status(200).json({ redirectUrl: "/home" });
});

app.get("/isauth", (req, res) => {
  if (req.user) {
    return res.status(200).json({ currentUser: req.user.id });
  }
  return res.status(401).json({ message: Unauthorized, redirectUrl: "/" });
});

app.listen(PORT, () => {
  console.log("Server running on port:", PORT);
});
