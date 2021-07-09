const router = require("express").Router();
const pool = require("../config/db");
const { isAdmin } = require("../authMiddleware");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().required(),
});

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM companies");
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
    // check if company already exists
    const [rows] = await pool.query(
      "SELECT * FROM companies WHERE name = ?",
      req.body.name
    );
    if (rows.length !== 0)
      return res.status(400).json({ message: "Company already exists" });
    const result = await pool.query(
      "INSERT INTO companies SET name = ?",
      req.body.name
    );
    return res
      .status(200)
      .json({ id: result[0].insertId, name: req.body.name });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
});

module.exports = router;
