const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

/**
 * POST /contact
 * Envoie un email de test via MailHog.
 */
router.post('/', async (req, res) => {
  const {
    to = 'test@example.com',
    subject = 'DevOps Foundations - Test email',
    message = 'Hello from /contact',
  } = req.body || {};

  const host = process.env.SMTP_HOST || 'localhost';
  const port = Number(process.env.SMTP_PORT || 1025);
  const from = process.env.MAIL_FROM || 'no-reply@devops.local';

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // MailHog ne nécessite pas TLS
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      text: message,
    });

    return res.json({
      status: 'sent',
      to,
      subject,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'email send failed',
    });
  }
});

module.exports = router;