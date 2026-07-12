const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Mangrove <noreply@mangrove.com>',
    to,
    subject,
    html: html || `<p>${text}</p>`,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;
