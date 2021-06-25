const router = require("express").Router();

//get all tickets only for admin
router.get("/", (req, res) => {});

//get own tickets
router.get("/user/:userId", (req, res) => {});

//POST new ticket

//PATCH ticket state only for admin

module.exports = router;
