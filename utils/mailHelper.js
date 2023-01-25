const transporter = require("../config/transporter.config.js");
const config = require("../config/index.js");

const mailHelper = async (options) => {
  
  const message = {
    from: config.SMTP_MAIL_EMAIL, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.text, // plain text body
    // html: "<b>Hello world?</b>", // html body
  };

  await transporter.sendMail(message);
};

module.exports = mailHelper;
