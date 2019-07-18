const nodeMailer = require("nodemailer");
const dotenv = require("dotenv");
const winston = require("winston");
const defaultEmailData = { from: "noreply@node-react.com" };

dotenv.config();

exports.sendEmail = emailData => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    requireTLS: true,
    auth: {
      user: process.env.EmailUserName,
      pass: process.env.EmailPassword
    }
  });
  return transporter
    .sendMail(emailData)
    .then(info => winston.info(`Message sent: ${info.response}`))
    .catch(err => winston.error(`Problem sending email: ${err}`));
};
