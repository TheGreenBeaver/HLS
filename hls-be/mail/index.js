const { isDev, getVar } = require('../util/env');
const nodemailer = require('nodemailer');

async function sendMail(content, receiver) {
  if (isDev) {
    return console.log(`TO: ${receiver}\nCONTENT: ${content}`)
  }

  const user = getVar('EMAIL_USER');
  const pass = getVar('EMAIL_PASS');
  const service = getVar('EMAIL_SERVICE');
  const sender = getVar('EMAIL_SENDER');

  const transporter = nodemailer.createTransport({ service, auth: { user, pass } });
  const message = {
    from: sender,
    to: receiver,
    ...content
  };

  return transporter.sendMail(message);
}

module.exports = sendMail;