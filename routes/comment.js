const router = require("express").Router();
const pool = require("../db");
const { isAuth } = require("../authMiddleware");
const Joi = require("joi");

const schema = Joi.object({
  currentUser: Joi.number().required(),
  ticket_id: Joi.number().required(),
  text: Joi.string().required(),
});

router.post("/", isAuth, async (req, res) => {
  //check if not owner and not admin
  if (req.user.id !== req.body.currentUser && !req.user.admin)
    return res.status(401).json({ message: "Not authorized to post" });
  //check if body is sound
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const comment = {
      owner_id: req.user.id,
      ticket_id: req.body.ticket_id,
      text: req.body.text,
    };
    const result = await pool.query("INSERT INTO comments SET ?", comment);
    return res.status(200).json({
      ...comment,
      type: "comment",
      id: result.insertId,
      email: req.user.email,
      created_date: Date.now(),
    });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

module.exports = router;
