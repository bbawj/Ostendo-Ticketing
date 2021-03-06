const router = require("express").Router();
const pool = require("../config/db");
const { isAuth } = require("../authMiddleware");
const Joi = require("joi");
const transporter = require("../config/mail");

const schema = Joi.object({
  currentUser: Joi.number().required(),
  ticket_id: Joi.number().required(),
  text: Joi.string().required(),
  email: Joi.string().required(),
  title: Joi.string().required(),
});

router.post("/", isAuth, async (req, res) => {
  //check if not owner and not admin
  if (req.user.id !== req.body.currentUser && !req.user.role !== "admin")
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
    // send email notifs
    const url = `http://128.199.72.149/ticket/${req.body.ticket_id}`;
    const output = `
      <h3>${req.user.email.split("@")[0]} has replied to your issue</h3>
      <a href="${url}">View your issue</a>
      `;
    transporter.sendMail({
      from: process.env.MAIL_USER,
      to: req.body.email,
      subject: `Issue #${req.body.ticket_id} ${req.body.title}`,
      html: output,
    });

    return res.status(200).json({
      ...comment,
      type: "comment",
      id: result[0].insertId,
      email: req.user.email,
      created_date: Date.now(),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
});

module.exports = router;
