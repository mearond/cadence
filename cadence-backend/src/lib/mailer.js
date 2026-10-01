import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendClientInviteEmail({ to, clientName, orgName, temporaryPassword }) {
  const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : 'http://localhost:5173/login';

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `You've been invited to ${orgName} on Cadence`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0D5C5C;">Welcome to Cadence</h2>
        <p>Hi ${clientName},</p>
        <p><strong>${orgName}</strong> has invited you to view your event on Cadence. Sign in with the credentials below:</p>
        <div style="background:#FAF8F3; border-radius:12px; padding:16px; margin:16px 0;">
          <p style="margin:4px 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin:4px 0;"><strong>Temporary password:</strong> ${temporaryPassword}</p>
        </div>
        <p>You'll be asked to set your own password the first time you sign in.</p>
        <a href="${loginUrl}" style="display:inline-block; background:#C9973F; color:#fff; padding:10px 20px; border-radius:999px; text-decoration:none; font-weight:600;">Sign In</a>
      </div>
    `,
  });
}