const { isDev } = require('../util/env');

async function sendMail(content, email) {
  if (isDev) {
    console.log(`TO: ${email}\nCONTENT: ${content}`)
  } else {
    // TODO: Send real emails
  }
}

module.exports = sendMail;