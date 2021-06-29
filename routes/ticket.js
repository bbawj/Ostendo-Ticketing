const router = require("express").Router();
const pool = require("../db");
const { isAuth, isAdmin } = require("../authMiddleware");
const Joi = require("joi");

const schema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
});

const statusSchema = Joi.object({
  status: Joi.string().valid("open", "closed"),
});

const filterSchema = Joi.object({
  text: Joi.string().allow(""),
  start: Joi.string().allow(""),
  end: Joi.string().allow(""),
  company: Joi.string().allow(""),
});

//post filter values from form to get ticket values
router.post("/admin", isAdmin, async (req, res) => {
  //Joi validation
  const { error } = filterSchema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  try {
    let queryString =
      "SELECT t.*, u.email from tickets as t JOIN users as u on t.owner_id = u.id WHERE";
    let queryArr = [];
    //build the query string
    if (req.body.text) {
      queryString =
        queryString +
        " MATCH(t.title, t.description) AGAINST (? in NATURAL LANGUAGE MODE) AND";
      queryArr.push(req.body.text);
    }
    if (req.body.start) {
      queryString = queryString + " t.created_date >= ? AND";
      queryArr.push(req.body.start);
    }
    if (req.body.end) {
      queryString = queryString + " t.created_date <= ? AND";
      queryArr.push(req.body.end);
    }
    if (req.body.company) {
      queryString = queryString + " u.company = ?";
      queryArr.push(req.body.company);
    }
    //remove trailing "AND" or "WHERE"
    if (queryString.slice(-3) === "AND") {
      queryString = queryString.slice(0, -3);
    } else if (queryString.slice(-5) === "WHERE") {
      queryString = queryString.slice(0, -5);
    }
    // use queryArr as second arguement if non-null
    if (queryArr.length === 0) {
      const [rows] = await pool.query(
        "SELECT t.*, u.email from tickets as t JOIN users as u on t.owner_id=u.id"
      );
      return res.status(200).json(rows);
    } else {
      const [rows] = await pool.query(queryString, queryArr);
      return res.status(200).json(rows);
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

router.get("/admin", isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT t.*, u.email from tickets as t JOIN users as u on t.owner_id=u.id"
    );
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

//get own tickets
router.get("/user", isAuth, async (req, res) => {
  try {
    const [data] = await pool.query(
      "select tickets.*, users.email from tickets join users on tickets.owner_id = users.id where owner_id = ?;",
      [req.user.id]
    );
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

//POST new ticket
router.post("/", isAuth, async (req, res) => {
  //check if body is null
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //build POST body
  try {
    const ticket = { ...req.body, owner_id: req.user.id };
    await pool.query("INSERT INTO tickets SET ?", ticket);
    return res.status(200).json({ message: "Successfully created ticket" });
  } catch (e) {
    return res.status(500).json({ message: e });
  }
});

//GET individual ticket
router.get("/:ticketId", isAuth, async (req, res) => {
  //get ticketsid and owner = req.user
  const [rows] = await pool.query(
    "SELECT owner_id FROM tickets where id = ?",
    req.params.ticketId
  );
  if (req.user.role !== "admin" && rows[0].owner_id !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  try {
    const [ticketData] = await pool.query(
      "SELECT tickets.*, users.email FROM tickets JOIN users ON tickets.owner_id=users.id WHERE tickets.id = ?",
      [req.params.ticketId]
    );
    const [commentData] = await pool.query(
      "SELECT comments.*, users.email FROM comments JOIN users on comments.owner_id=users.id WHERE ticket_id = ? ORDER BY comments.created_date",
      req.params.ticketId
    );
    return res.json({ ticketData: ticketData[0], commentData: commentData });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

//PATCH ticket state only for admin/owner
router.patch("/:ticketId", isAuth, async (req, res) => {
  // validate with status schema
  const { error } = statusSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //check if ticket exists
  const [rows] = await pool.query(
    "SELECT * FROM tickets WHERE id = ? LIMIT 1",
    req.params.ticketId
  );
  if (rows.length === 0)
    return res.status(404).json({ message: "Ticket not found" });
  await pool.query("UPDATE tickets SET status = ? WHERE id = ?", [
    req.body.status,
    req.params.ticketId,
  ]);
  // add new comment for status update
  const statusComment = {
    type: "update",
    owner_id: req.user.id,
    ticket_id: req.params.ticketId,
    text: req.body.status,
  };
  await pool.query("INSERT INTO comments SET ?", statusComment);
  return res
    .status(200)
    .json({ message: "Successfully updated ticket status" });
});

//DELETE ticket

module.exports = router;
