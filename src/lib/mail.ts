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

  profileCompleted: (email: string, firstName: string | null) => ({
    to: email,
    subject: "🎉 Your Profile Is Complete!",
    html: `
      <h2>Welcome, ${firstName ?? "User"}! 🎉</h2>
      <p>Your profile has been successfully created.</p>
      <p>You are now fully onboarded and ready to use the Digital Auction Platform.</p>
      <p>Start exploring real time auctions, bidding on items, and enjoying the platform.</p>
      <br/>
      <small>Digital Auction Platform Team</small>
    `,
  }),

  resetPassword: (email: string) => ({
    to: email,
    subject: "🔐 Your Password Has Been Reset",
    html: `
      <h2>Password Reset Successful</h2>
      <p>Hello,</p>
      <p>Your password has been updated successfully.</p>
      <p>If you did NOT request this password reset, please secure your account immediately.</p>
      <br/>
      <small>Digital Auction Platform Team</small>
    `,
  }),

  // ✅ New template for profile update
  profileUpdated: (email: string, firstName: string | null) => ({
    to: email,
    subject: "✏️ Your Profile Has Been Updated",
    html: `
      <h2>Hello, ${firstName ?? "User"}!</h2>
      <p>Your profile information has been successfully updated.</p>
      <p>If you did NOT make these changes, please contact support immediately.</p>
      <br/>
      <small>Digital Auction Platform Team</small>
    `,
  }),
};
