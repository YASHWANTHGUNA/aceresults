import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM || "ACE Results <no-reply@yourdomain.com>";

export async function sendEmail({ to, subject, html }) {
  const provider = process.env.EMAIL_PROVIDER || "resend";

  if (provider === "testmail") {
    // testmail.app inbox-tag workflow for development
    return resend
      ? resend.emails.send({ from: FROM, to, subject, html })
      : console.log("[testmail-dev] would send:", { to, subject });
  }

  if (!resend) {
    throw new Error("RESEND_API_KEY not configured");
  }

  return resend.emails.send({ from: FROM, to, subject, html });
}

export function otpEmailHtml(otp) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:auto;font-family:sans-serif;">
  <tr>
    <td>
      <h2 style="margin:0 0 12px 0;">Your verification code</h2>
      <p style="font-size:32px;font-weight:bold;letter-spacing:4px;margin:0 0 12px 0;">${otp}</p>
      <p style="margin:0;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </td>
  </tr>
</table>`;
}

export function loginAlertHtml({ rollNumber, ip, time, notMeUrl, confirmUrl }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:auto;font-family:sans-serif;">
  <tr>
    <td>
      <h2 style="margin:0 0 12px 0;">New login detected</h2>
      <p style="margin:0 0 12px 0;">A login to your ACE Results account was detected.</p>
      <p style="margin:0 0 12px 0;">
        <b>Roll Number:</b> ${rollNumber}<br/>
        <b>Time:</b> ${time}<br/>
        <b>IP:</b> ${ip}
      </p>
      <p style="margin:0 0 16px 0;">If this was you, tap below to confirm — or secure your account if it wasn't.</p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:10px;">
            <a href="${confirmUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Yes, it's me</a>
          </td>
          <td>
            <a href="${notMeUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">Secure My Account</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export function passwordChangedHtml() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:auto;font-family:sans-serif;">
  <tr>
    <td>
      <p style="margin:0;">Your password was just changed. If this wasn't you, contact the academic office immediately.</p>
    </td>
  </tr>
</table>`;
}