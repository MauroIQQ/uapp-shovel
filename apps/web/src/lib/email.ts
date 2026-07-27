import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, html: string) {
  console.log("sendEmail to:", to, "SMTP_USER:", process.env.SMTP_USER ? "✓" : "✗", "SMTP_PASS:", process.env.SMTP_PASS ? "✓" : "✗");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}
