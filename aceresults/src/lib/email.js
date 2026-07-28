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
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>Your verification code</h2>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `;
}

export function loginAlertHtml({ rollNumber, ip, time, notMeUrl, confirmUrl }) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <h2>New login detected</h2>
      <p>A login to your ACE Results account was detected.</p>
      <p>
        <b>Roll Number:</b> ${rollNumber}<br/>
        <b>Time:</b> ${time}<br/>
        <b>IP:</b> ${ip}
      </p>
      <p>If this was you, tap below to confirm — or secure your account if it wasn't.</p>
      <div style="margin-top:16px;">
        <a href="${confirmUrl}" style="display:inline-block;background:#16a34a;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;margin-right:10px;">
          Yes, it's me
        </a>
        <a href="${notMeUrl}" style="display:inline-block;background:#dc2626;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">
          Secure My Account
        </a>
      </div>
    </div>
  `;
}

export function passwordChangedHtml() {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
      <p>Your password was just changed. If this wasn't you, contact the academic office immediately.</p>
    </div>
  `;
}