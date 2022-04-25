function verify(link) {
  return `
      <table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0">
        <tr>
          <td style="color: #424242">This is an auto-sent message from InSight video service. Please do not reply to it.</td>
        </tr>
        <tr><td>You have successfully signed up for InSight!</td></tr>
        <tr><td>Follow this link to verify your account and finish registration:</td></tr>
        <tr>
          <td><a 
            href=${link} 
            style="font: 14px Arial, sans-serif; color: blue; line-height: 30px; -webkit-text-size-adjust: none; display: block;" target="_blank"
          >${link}</a></td>
        </tr>
      </table>
    `;
}

function changePassword(link) {
  return `
      <table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0">
        <tr>
          <td style="color: #424242">This is an auto-sent message from InSight video service. Please do not reply to it.</td>
        </tr>
        <tr>
          <td>There was a request to change password for an InSight account bound to this email address. If that wasn't you, please ignore this message.</td>
        </tr>
        <tr>
          <td>Otherwise, follow this link to confirm the changes:</td>
        </tr>
        <tr>
          <td><a 
          href=${link} 
          style="font: 14px Arial, sans-serif; line-height: 30px; color: blue; -webkit-text-size-adjust: none; display: block;" target="_blank"
          >${link}</a>
          </td>
        </tr>
      </table>
    `;
}

function resetPassword(link) {
  return `
      <table border="0" cellpadding="0" cellspacing="0" style="margin:0; padding:0">
        <tr>
          <td style="color: #424242">This is an auto-sent message from InSight video service. Please do not reply to it.</td>
        </tr>
        <tr>
          <td>There was a request to reset password for an InSight account bound to this email address. If that wasn't you, please ignore this message.</td>
        </tr>
        <tr>
          <td>Otherwise, follow this link to finish the resetting process:</td>
        </tr>
        <tr>
          <td><a 
          href=${link} 
          style="font: 14px Arial, sans-serif; line-height: 30px; color: blue; -webkit-text-size-adjust: none; display: block;" target="_blank"
          >${link}</a>
          </td>
        </tr>
      </table>
    `;
}

module.exports = {
  verify, resetPassword, changePassword
};