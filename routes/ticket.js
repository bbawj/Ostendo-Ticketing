const router = require("express").Router();
const pool = require("../config/db");
const { isAuth, isAdmin } = require("../authMiddleware");
const Joi = require("joi");
const transporter = require("../config/mail");

const schema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  owner_id: Joi.number().integer(),
  assigned_id: Joi.number().integer(),
});

const updateSchema = Joi.object({
  status: Joi.string().valid("open", "closed", "closedbyadmin"),
  label: Joi.number().integer(),
  conclusion: Joi.string().allow(""),
  method: Joi.string().valid("add", "delete"),
  assignee: Joi.string(),
  email: Joi.string(),
});

const exportSchema = Joi.object({
  type: Joi.string().valid("user", "category", "detail"),
  start: Joi.string().required(),
  end: Joi.string().required(),
});

const filterSchema = Joi.object({
  text: Joi.string().allow(""),
  company: Joi.string().allow(""),
  start: Joi.string().allow(""),
  end: Joi.string().allow(""),
  last: Joi.number().integer(),
  status: Joi.array().items(Joi.string()),
  order: Joi.string().valid("asc", "desc"),
});

//get own tickets
router.get("/user", isAuth, async (req, res) => {
  //Joi validation
  const { error } = filterSchema.validate(req.query);
  if (error) return res.status(400).json(error.details[0].message);
  try {
    let queryString =
      "SELECT t.*, u.email, c.name as company, GROUP_CONCAT(l.name) as label from tickets as t JOIN users as u on t.owner_id = u.id JOIN companies as c ON u.company_id = c.id LEFT JOIN tickets_labels as tl on tl.ticket_id = t.id LEFT JOIN labels as l on tl.label_id = l.id WHERE";
    let queryArr = [];
    //build the query string
    queryString = queryString + " t.owner_id = ? AND";
    queryArr.push(req.user.id);
    if (req.query.text) {
      queryString =
        queryString +
        " MATCH(t.title, t.description) AGAINST (? in NATURAL LANGUAGE MODE) AND";
      queryArr.push(req.query.text);
    }
    if (req.query.start) {
      queryString = queryString + " t.created_date >= ? AND";
      queryArr.push(req.query.start);
    }
    if (req.query.end) {
      queryString = queryString + " t.created_date < ? AND";
      queryArr.push(req.query.end);
    }
    if (req.query.last) {
      queryString =
        req.query.order === "asc"
          ? queryString + " t.id > ? AND"
          : queryString + " t.id < ? AND";
      queryArr.push(req.query.last);
    }
    if (req.query.status) {
      queryString = queryString + " t.status IN (?) AND";
      queryArr.push(req.query.status);
    }
    //remove trailing "AND" or "WHERE"
    if (queryString.slice(-3) === "AND") {
      queryString = queryString.slice(0, -3);
    } else if (queryString.slice(-5) === "WHERE") {
      queryString = queryString.slice(0, -5);
    }
    // add group by
    if (req.query.order === "asc") {
      queryString = queryString + " GROUP BY t.id ORDER BY t.id LIMIT 5";
    } else {
      queryString = queryString + " GROUP BY t.id ORDER BY t.id DESC LIMIT 5";
    }

    const [rows] = await pool.query(queryString, queryArr);
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
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
    const url = `http://128.199.72.149/ticket/${result[0].insertId}`;
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
  if (
    !req.user ||
    (req.user.role !== "admin" && rows[0].owner_id !== req.user.id)
  ) {
    return res.status(403).json({ message: "Unauthorized" });
  }
  try {
    const [ticketData] = await pool.query(
      "SELECT t.*, u.email, GROUP_CONCAT(l.name) as label, users.email as assigned FROM tickets as t JOIN users as u ON t.owner_id=u.id LEFT JOIN users ON t.assigned_id=users.id LEFT JOIN tickets_labels as tl on tl.ticket_id = t.id LEFT JOIN labels as l on tl.label_id = l.id WHERE t.id = ?",
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
    //set emil urls
    const url = `http://128.199.72.149/ticket/${req.params.ticketId}`;
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
      // send email notifs
      const statusOutput = req.body.status === "open" ? "open" : "closed";
      const output = `
      <h3>The status of ticket #${req.params.ticketId} has been changed to: ${statusOutput}</h3>
      <a href="${url}">View updates</a>
      `;
      transporter.sendMail({
        from: process.env.MAIL_USER,
        to: req.body.email,
        subject: `Status update for ticket #${req.params.ticketId}`,
        html: output,
      });
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
    } else if (req.body.assignee) {
      // change assigned_id of ticket
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        req.body.assignee
      );
      if (rows.length === 0)
        return res.status(400).json({ message: "No user with that email" });
      await pool.query("UPDATE tickets SET assigned_id = ? WHERE id = ?", [
        rows[0].id,
        req.params.ticketId,
      ]);
      //notify new assignee
      const output = `
      <h3>You have been assigned a new issue on Ostendo Ticketing:</h3>
      <a href="${url}">View new issue</a>
      `;
      transporter.sendMail({
        from: process.env.MAIL_USER,
        to: req.body.assignee,
        subject: "New Issue Assigned",
        html: output,
      });

      return res
        .status(200)
        .json({ message: "Successfully updated ticket assignee" });
    }
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/export", isAdmin, async (req, res) => {
  // validate with export schema
  const { error } = exportSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  if (req.body.type === "user") {
    const [rows] = await pool.query(
      "select u.email, count(*) as count from tickets as t join users as u on t.owner_id = u.id where t.created_date >= ? and t.created_date < ? group by u.id",
      [req.body.start, req.body.end]
    );
    return res.status(200).json({ data: rows });
  } else if (req.body.type === "category") {
    const [rows] = await pool.query(
      "SELECT l.name, COUNT(*) as count FROM tickets AS t JOIN tickets_labels as tl on t.owner_id=tl.ticket_id JOIN labels AS l on tl.label_id=l.id WHERE t.created_date >= ? AND t.created_date < ? GROUP BY l.name",
      [req.body.start, req.body.end]
    );
    return res.status(200).json({ data: rows });
  } else if (req.body.type === "detail") {
    const [rows] = await pool.query(
      "SELECT t.*, u.email, c.name as company, GROUP_CONCAT(l.name) as label from tickets as t JOIN users as u on t.owner_id = u.id JOIN companies as c ON u.company_id = c.id LEFT JOIN tickets_labels as tl on tl.ticket_id = t.id LEFT JOIN labels as l on tl.label_id = l.id WHERE t.created_date >= ? AND t.created_date < ? GROUP BY t.id ORDER BY t.id",
      [req.body.start, req.body.end]
    );
    return res.status(200).json({ data: rows });
  }
});

//DELETE ticket

module.exports = router;
