const nodemailer = require("nodemailer");
//mail config
const mailConfig = {
  host: "mail.ostendoasia.com",
  port: 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(mailConfig);

module.exports = transporter;
