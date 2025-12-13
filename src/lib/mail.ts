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

  emailChanged: (email: string) => ({
    to: email,
    subject: "Email Changed Successfully",
    html: `
      <h2>Email Updated</h2>
      <p>Hello,</p>
      <p>Your account email has been changed successfully to <strong>${email}</strong>.</p>
      <p>If you did not request this change, please secure your account immediately.</p>
      <br/>
      <small>Digital Auction Platform</small>
    `,
  }),

  // src/lib/mail.ts - ADD THESE NEW TEMPLATES TO YOUR EXISTING EmailTemplates OBJECT

  /**
   * NEW EMAIL TEMPLATES FOR AUCTION PLATFORM
   * Add these to your existing EmailTemplates object in mail.ts
   */

  // Template for notifying the auction winner
  auctionWon: (data: {
    winnerEmail: string;
    winnerName: string;
    productTitle: string;
    finalBidAmount: number;
    deliveryFee: number;
    totalAmount: number;
    sellerPhone: string;
  }) => ({
    to: data.winnerEmail,
    subject: `🎉 Congratulations! You Won: ${data.productTitle}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0070f3;">🎉 Congratulations, ${data.winnerName}!</h2>
      
      <p>You have won the auction for <strong>${data.productTitle}</strong>!</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Payment Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Winning Bid:</strong></td>
            <td style="text-align: right;">$${data.finalBidAmount.toFixed(
              2
            )}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Delivery Fee:</strong></td>
            <td style="text-align: right;">$${data.deliveryFee.toFixed(2)}</td>
          </tr>
          <tr style="border-top: 2px solid #333;">
            <td style="padding: 8px 0;"><strong>Total to Pay:</strong></td>
            <td style="text-align: right; font-size: 20px; color: #0070f3;">
              <strong>$${data.totalAmount.toFixed(2)}</strong>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">📦 Delivery Instructions:</h3>
        <p style="margin: 5px 0;">
          <strong>Ahmad Delivery</strong> will contact you shortly to arrange pickup.
        </p>
        <p style="margin: 5px 0;">
          <strong>Payment:</strong> Please pay the delivery agent <strong>$${data.totalAmount.toFixed(
            2
          )}</strong> in cash upon receiving your item.
        </p>
        <p style="margin: 5px 0;">
          <strong>Seller Contact:</strong> ${data.sellerPhone}
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you have any questions, please contact support.
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <small style="color: #999;">Digital Auction Platform Team</small>
    </div>
  `,
  }),

  // Template for notifying the seller
  auctionSold: (data: {
    sellerEmail: string;
    sellerName: string;
    productTitle: string;
    finalBidAmount: number;
    platformCommission: number;
    sellerPayout: number;
    winnerName: string;
    winnerPhone: string;
  }) => ({
    to: data.sellerEmail,
    subject: `✅ Your Item Sold: ${data.productTitle}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #28a745;">✅ Great News, ${data.sellerName}!</h2>
      
      <p>Your item <strong>${data.productTitle}</strong> has been sold!</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Financial Summary:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Final Bid:</strong></td>
            <td style="text-align: right;">$${data.finalBidAmount.toFixed(
              2
            )}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Platform Commission (6%):</strong></td>
            <td style="text-align: right; color: #dc3545;">-$${data.platformCommission.toFixed(
              2
            )}</td>
          </tr>
          <tr style="border-top: 2px solid #333;">
            <td style="padding: 8px 0;"><strong>Your Payout:</strong></td>
            <td style="text-align: right; font-size: 20px; color: #28a745;">
              <strong>$${data.sellerPayout.toFixed(2)}</strong>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #0c5460; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0c5460;">📦 Next Steps:</h3>
        <p style="margin: 5px 0;">
          1. <strong>Ahmad Delivery</strong> will contact you to arrange item pickup
        </p>
        <p style="margin: 5px 0;">
          2. They will collect <strong>$${data.finalBidAmount.toFixed(
            2
          )}</strong> from the buyer
        </p>
        <p style="margin: 5px 0;">
          3. You will receive <strong>$${data.sellerPayout.toFixed(
            2
          )}</strong> after delivery confirmation
        </p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">👤 Buyer Information:</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${data.winnerName}</p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${
          data.winnerPhone
        }</p>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Thank you for using our platform!
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <small style="color: #999;">Digital Auction Platform Team</small>
    </div>
  `,
  }),

  // Template for no bids (auction expired with no winner)
  auctionExpiredNoBids: (data: {
    sellerEmail: string;
    sellerName: string;
    productTitle: string;
  }) => ({
    to: data.sellerEmail,
    subject: `Auction Ended: ${data.productTitle}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Auction Ended</h2>
      
      <p>Hello ${data.sellerName},</p>
      
      <p>Your auction for <strong>${data.productTitle}</strong> has ended.</p>
      
      <p>Unfortunately, there were no bids placed on this item.</p>
      
      <p>You can:</p>
      <ul>
        <li>Edit the product and create a new auction</li>
        <li>Adjust the starting price</li>
        <li>Add more details or better images</li>
      </ul>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Thank you for using Digital Auction Platform.
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <small style="color: #999;">Digital Auction Platform Team</small>
    </div>
  `,
  }),
};
