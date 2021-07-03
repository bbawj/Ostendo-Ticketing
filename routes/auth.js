const router = require("express").Router();
const pool = require("../config/db");
const { isAuth } = require("../authMiddleware");
const Joi = require("joi");
const transporter = require("../config/mail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const passport = require("passport");

const schema = Joi.object({
  currentUser: Joi.number().required(),
  ticket_id: Joi.number().required(),
  text: Joi.string().required(),
  email: Joi.string().required(),
  title: Joi.string().required(),
});

const resetSchema = Joi.object({
  password: Joi.string().required(),
  passwordConfirm: Joi.string().required().valid(Joi.ref("password")),
});

router.post("/register", async (req, res) => {
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
    const newUser = {
      email: req.body.email,
      password: hashedPassword,
      company: req.body.company,
    };
    const result = await pool.query("INSERT INTO users SET ?", newUser);
    passport.authenticate("local")(req, res, () => {
      return res
        .status(200)
        .json({ id: req.user.id, role: req.user.role, redirectUrl: "/home" });
    });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  return res
    .status(200)
    .json({ id: req.user.id, role: req.user.role, redirectUrl: "/home" });
});

router.get("/isauth", isAuth, (req, res) => {
  if (req.user) {
    return res.status(200).json({ id: req.user.id, role: req.user.role });
  }
  return res.status(401).json({ message: "Unauthorized" });
});

router.post("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  res.json({ redirectUrl: "/login", message: "Logged out." });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      req.body.email,
    ]);
    // check if user exists
    if (rows.length === 0)
      return res.status(404).json({ message: "Invalid email" });
    const userId = rows[0].id;
    jwt.sign(
      { id: userId },
      rows[0].password + "-" + process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "30m" },
      async (err, emailToken) => {
        const url =
          process.env.NODE_ENV === "production"
            ? `http://128.199.72.149/reset/${userId}/${emailToken}`
            : `http://localhost:3000/reset/${userId}/${emailToken}`;
        const output = `
      <h3>Click on the link to reset your password:</h3>
      <a href="${url}">Reset your password</a>`;
        transporter.sendMail({
          from: process.env.MAIL_USER,
          to: req.body.email,
          subject: "Reset your password",
          html: output,
        });
      }
    );
    return res.status(200).json({ message: "Email has been sent." });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
});

router.post("/reset-password/:id/:token", async (req, res) => {
  try {
    const { error } = resetSchema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    // check if user exists
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      req.params.id
    );
    if (rows.length === 0)
      return res.status(404).send({ message: "User not found" });

    const { id } = jwt.verify(
      req.params.token,
      rows[0].password + "-" + process.env.RESET_PASSWORD_SECRET
    );

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      id,
    ]);
    return res.status(200).json({ message: "Password reset" });
  } catch (err) {
    return res.status(400).send("Link is invalid or has expired.");
  }
});

module.exports = router;
