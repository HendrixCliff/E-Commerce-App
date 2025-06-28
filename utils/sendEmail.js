// utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // 👈 Explicit port
  secure: false, // false = STARTTLS (required for 587)
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Optional: disable if self-signed certs cause issues
  }
});

exports.sendOrderConfirmation = async (to, subject, html, buffer, fileName) => {
  await transporter.sendMail({
    from: `"Your Store" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: fileName,
        content: buffer,
        contentType: 'application/pdf'
      }
    ]
  });
};
