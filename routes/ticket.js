const router = require("express").Router();
const pool = require("../config/db");
const { isAuth, isAdmin } = require("../authMiddleware");
const Joi = require("joi");
const transporter = require("../config/mail");

const schema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
});

const updateSchema = Joi.object({
  status: Joi.string().valid("open", "closed", "closedbyadmin"),
  label: Joi.number().integer(),
  conclusion: Joi.string().allow(""),
  method: Joi.string().valid("add", "delete"),
});

const filterSchema = Joi.object({
  text: Joi.string().allow(""),
  start: Joi.string().allow(""),
  end: Joi.string().allow(""),
  company: Joi.string().allow(""),
});

const exportSchema = Joi.object({
  type: Joi.string().valid("user", "category"),
});

//post filter values from form to get ticket values
router.post("/admin", isAdmin, async (req, res) => {
  //Joi validation
  const { error } = filterSchema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  try {
    let queryString =
      "SELECT t.*, u.email, u.company, GROUP_CONCAT(l.name) as label from tickets as t JOIN users as u on t.owner_id = u.id LEFT JOIN tickets_labels as tl on tl.ticket_id = t.id LEFT JOIN labels as l on tl.label_id = l.id WHERE";
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
    // add group by
    queryString = queryString + " GROUP BY t.id";
    // use queryArr as second arguement if non-null
    if (queryArr.length === 0) {
      const [rows] = await pool.query(
        "SELECT t.*, u.email, u.company, GROUP_CONCAT(l.name) as label from tickets as t JOIN users as u on t.owner_id=u.id LEFT JOIN tickets_labels as tl on tl.ticket_id = t.id LEFT JOIN labels as l on tl.label_id = l.id GROUP BY t.id"
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
      "SELECT t.*, u.email, u.company, GROUP_CONCAT(l.name) as label from tickets as t JOIN users as u on t.owner_id=u.id LEFT JOIN tickets_labels as tl on tl.ticket_id = t.id LEFT JOIN labels as l on tl.label_id = l.id GROUP BY t.id"
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
      "SELECT t.*, u.email, GROUP_CONCAT(l.name) as label from tickets as t JOIN users as u on t.owner_id=u.id LEFT JOIN tickets_labels as tl on tl.ticket_id = t.id LEFT JOIN labels as l on tl.label_id = l.id WHERE t.owner_id = ? GROUP BY t.id",
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
    const result = await pool.query("INSERT INTO tickets SET ?", ticket);
    // send email to default admin
    const url =
      process.env.NODE_ENV === "production"
        ? `http://128.199.72.149/ticket/${result[0].insertId}`
        : `http://localhost:3000/ticket/${result[0].insertId}`;
    const output = `
      <a href="${url}">View new issue</a>
      `;
    transporter.sendMail({
      from: process.env.MAIL_USER,
      to: "brendanawjang@gmail.com", // defualt admin email
      subject: "New Issue Created",
      html: output,
    });
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
      "SELECT t.*, u.email, GROUP_CONCAT(l.name) as label FROM tickets as t JOIN users as u ON t.owner_id=u.id LEFT JOIN tickets_labels as tl on tl.ticket_id = t.id LEFT JOIN labels as l on tl.label_id = l.id WHERE t.id = ?",
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
  const { error } = updateSchema.validate(req.body);
  // console.log(error.details[0].message);
  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    //check if ticket exists
    const [rows] = await pool.query(
      "SELECT * FROM tickets WHERE id = ? LIMIT 1",
      req.params.ticketId
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Ticket not found" });
    // update status only
    if (req.body.status) {
      //update closed_date datetime if status is changed to close
      if (req.body.status === "open") {
        await pool.query("UPDATE tickets SET status = ? WHERE id = ?", [
          req.body.status,
          req.params.ticketId,
        ]);
      } else {
        await pool.query(
          "UPDATE tickets SET status = ?, conclusion = ? ,closed_date = current_timestamp WHERE id = ?",
          [req.body.status, req.body.conclusion, req.params.ticketId]
        );
      }
      // add new comment for status update
      const statusComment = {
        type: req.body.status,
        owner_id: req.user.id,
        ticket_id: req.params.ticketId,
        text: req.body.status === "open" ? "" : req.body.conclusion,
      };
      await pool.query("INSERT INTO comments SET ?", statusComment);
      return res
        .status(200)
        .json({ message: "Successfully updated ticket status" });
    } else if (req.body.label) {
      if (req.body.method === "add") {
        const label = {
          ticket_id: req.params.ticketId,
          label_id: req.body.label,
        };
        await pool.query("INSERT INTO tickets_labels SET ?", label);
      } else if (req.body.method === "delete") {
        await pool.query(
          "DELETE FROM tickets_labels WHERE ticket_id = ? AND label_id = ?",
          [req.params.ticketId, req.body.label]
        );
      }
      return res
        .status(200)
        .json({ message: "Successfully updated ticket label" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/export", isAuth, async (req, res) => {
  // validate with export schema
  const { error } = exportSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  if (req.body.type === "user") {
    const [rows] = await pool.query(
      "select u.email, count(*) as count from tickets as t join users as u on t.owner_id = u.id where t.created_date >= ? and t.created_date <= ? group by u.id",
      [req.body.start, req.body.end]
    );
    return res.status(200).json({ data: rows });
  } else if (req.body.type === "category") {
    const [rows] = await pool.query(
      "SELECT l.name, COUNT(*) as count FROM tickets AS t JOIN tickets_labels as tl on t.owner_id=tl.ticket_id JOIN labels AS l on tl.label_id=l.id WHERE t.created_date >= ? AND t.created_date <= ? GROUP BY l.name",
      [req.body.start, req.body.end]
    );
    return res.status(200).json({ data: rows });
  }
});

//DELETE ticket

module.exports = router;
