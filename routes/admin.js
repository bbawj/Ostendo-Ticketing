const router = require("express").Router();
const pool = require("../config/db");
const { isAdmin } = require("../authMiddleware");
const Joi = require("joi");
const transporter = require("../config/mail");

const filterSchema = Joi.object({
  text: Joi.string().allow(""),
  start: Joi.string().allow(""),
  end: Joi.string().allow(""),
  company: Joi.number().integer(),
  last: Joi.number().integer(),
  status: Joi.array().items(Joi.string()),
  order: Joi.string().valid("asc", "desc"),
  user: Joi.number().integer(),
});

//get tickets assigned to a particular admin
router.get("/", isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT t.*, u.email, c.name as company, GROUP_CONCAT(l.name) as label from tickets as t JOIN users as u on t.owner_id = u.id JOIN companies as c ON u.company_id = c.id LEFT JOIN tickets_labels as tl on tl.ticket_id = t.id LEFT JOIN labels as l on tl.label_id = l.id WHERE t.assigned_id = ? GROUP BY t.id LIMIT 5",
      req.user.id
    );
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching assigned tickets" });
  }
});

//post filter values from form to get ticket values
router.post("/", isAdmin, async (req, res) => {
  //Joi validation
  const { error } = filterSchema.validate(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  try {
    let queryString =
      "SELECT t.*, u.email, c.name as company, GROUP_CONCAT(l.name) as label from tickets as t JOIN users as u on t.owner_id = u.id JOIN companies as c ON u.company_id = c.id LEFT JOIN tickets_labels as tl on tl.ticket_id = t.id LEFT JOIN labels as l on tl.label_id = l.id WHERE";
    let queryArr = [];
    //build the query string
    if (req.body.user) {
      queryString = queryString + " t.assigned_id = ? AND";
      queryArr.push(req.user.id);
    }
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
      queryString = queryString + " t.created_date < ? AND";
      queryArr.push(req.body.end);
    }
    if (req.body.last) {
      queryString =
        req.body.order === "asc"
          ? queryString + " t.id > ? AND"
          : queryString + " t.id < ? AND";
      queryArr.push(req.body.last);
    }
    if (req.body.status) {
      queryString = queryString + " t.status IN (?) AND";
      queryArr.push(req.body.status);
    }
    if (req.body.company) {
      queryString = queryString + " u.company_id = ?";
      queryArr.push(req.body.company);
    }
    //remove trailing "AND" or "WHERE"
    if (queryString.slice(-3) === "AND") {
      queryString = queryString.slice(0, -3);
    } else if (queryString.slice(-5) === "WHERE") {
      queryString = queryString.slice(0, -5);
    }
    // add group by
    if (req.body.order === "asc") {
      queryString = queryString + " GROUP BY t.id ORDER BY t.id LIMIT 5";
    } else {
      queryString = queryString + " GROUP BY t.id ORDER BY t.id DESC LIMIT 5";
    }

    const [rows] = await pool.query(queryString, queryArr);
    return res.status(200).json(rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err });
  }
});

module.exports = router;
