const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://friseur.neunzigzehn.net');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, phone, timeOfDay, dayOfWeek, email, message } = req.body;

    if (type === 'callback' && !phone) return res.status(400).json({ error: 'Telefonnummer fehlt' });
    if (type === 'email' && !email) return res.status(400).json({ error: 'E-Mail fehlt' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
    });

    let subject, text;
    if (type === 'callback') {
      subject = 'Rückruf-Anfrage: ' + phone;
      text = 'Neue Rückruf-Anfrage von friseur.neunzigzehn.net\n\nTelefon: ' + phone + '\nZeit: ' + (timeOfDay || 'k.A.') + '\nTag: ' + (dayOfWeek || 'k.A.');
    } else {
      subject = 'Angebot-Anfrage: ' + email;
      text = 'Neue Angebot-Anfrage von friseur.neunzigzehn.net\n\nE-Mail: ' + email + '\nNachricht: ' + (message || 'Keine Nachricht');
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER,
      subject,
      text
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mail error:', error);
    return res.status(500).json({ error: 'Senden fehlgeschlagen' });
  }
};
