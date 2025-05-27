// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'renukadeviac2006@gmail.com',
    pass: 'ttzrafkwqcwmajhv',
  },
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: '"Controller of Resources" <renukadeviac2006@gmail.com>',
    to: to,
    subject: subject,
    text: text,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
