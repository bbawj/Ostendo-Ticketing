const router = require("express").Router();
const pool = require("../config/db");
const { isAdmin } = require("../authMiddleware");
const Joi = require("joi");
const bcrypt = require("bcrypt");

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
    await pool.query("INSERT INTO users SET ?", user);
    return res.status(200).json({ message: "New user created" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
});

module.exports = router;
