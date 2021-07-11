const router = require("express").Router();
const pool = require("../config/db");
const { isAdmin } = require("../authMiddleware");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const transporter = require("../config/mail");

const schema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
  passwordConfirm: Joi.string().required().valid(Joi.ref("password")),
  company: Joi.number().integer().required(),
});

router.get("/", isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, email, role FROM users");
    return res.status(200).json(rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
});

router.post("/", isAdmin, async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    // check if user already exists
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      req.body.email
    );
    if (rows.length !== 0)
      return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      email: req.body.email,
      password: hashedPassword,
      company_id: req.body.company,
    };
    const result = await pool.query("INSERT INTO users SET ?", user);
    // generate reset-password JWT
    jwt.sign(
      { id: result.insertId },
      req.body.password + "-" + process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "5d" },
      async (err, emailToken) => {
        // send email notifs
        const url = `http://128.199.72.149/reset/${result.insertId}/${emailToken}`;
        const output = `
      <h3>Ostendo Asia Ticketing is a website meant to help you track and log IT-related issues and tickets with ease.</h3>
      <h4>An administrator has created an account for you to track your most recent issue.</h4>
      <h4>Click <a href="${url}">here</a> within 5 days to reset your password and login to view.</h4>
      <p>Trouble resetting your password? Your link may have expired. Click <a href="http://128.199.72.149/forgot-password">here</a> to generate a new link.</p>
      `;
        transporter.sendMail({
          from: process.env.MAIL_USER,
          to: req.body.email,
          subject: "New Account Created on Ostendo Asia Ticketing",
          html: output,
        });
      }
    );
    return res.status(200).json({ message: "New user created" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
});

module.exports = router;
