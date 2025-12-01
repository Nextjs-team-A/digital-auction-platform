// lib/mail.ts
// Centralized email sending helper for the Auction Platform

import nodemailer from "nodemailer";

/**
 * Gmail SMTP Transporter (must use port 465 + secure:true)
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Required for Gmail SSL
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!, // MUST be a Gmail App Password
  },
});

/**
 * Debug SMTP connection on startup
 */
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email server connection failed:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

/**
 * Send email (HTML supported)
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const { to, subject, html, text } = options;

  return transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
    text: text || "Your email client does not support HTML.",
  });
}

/**
 * Email Templates
 */
export const EmailTemplates = {
  passwordChanged: (email: string) => ({
    to: email,
    subject: "Your Password Has Been Changed",
    html: `
      <h2>Password Successfully Updated</h2>
      <p>Hello,</p>
      <p>Your password was just changed.</p>
      <p>If you did NOT perform this action, please reset your password immediately.</p>
      <br/>
      <small>Digital Auction Platform</small>
    `,
  }),

  welcome: (email: string) => ({
    to: email,
    subject: "Welcome to Digital Auction Platform",
    html: `
      <h2>🎉 Welcome!</h2>
      <p>Your account was created successfully.</p>
      <p>You can now log in and start using the platform.</p>
      <br/>
      <small>Digital Auction Platform</small>
    `,
  }),
};
