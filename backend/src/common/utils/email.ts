import nodemailer from "nodemailer";
import { config } from "../../config/env.js";

// Initialize singleton transporter
const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: config.emailSecure,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Low-level email dispatcher
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!config.emailUser || !config.emailPass) {
    console.warn("[EMAIL] SMTP credentials missing. Skipping email dispatch.");
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: config.emailFrom,
      to: options.to,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
    });

    console.log(`[EMAIL] Dispatched to ${options.to} (MessageId: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to dispatch to ${options.to}:`, error);
    return false;
  }
}

/**
 * Sends a branded password reset email with secure 1-hour link
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  recipientName: string,
  resetToken: string
): Promise<boolean> {
  const resetLink = `${config.clientUrl}/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Assessly Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540px" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 28px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Assessly</h1>
              <p style="color: #d1fae5; margin: 6px 0 0 0; font-size: 13px;">Exit Exam Preparation & Assessment Platform</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
                Hello <strong>${recipientName || "Candidate"}</strong>,
              </p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                We received a request to reset the password for your Assessly account. Click the button below to choose a new password:
              </p>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 12px 0 28px 0;">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Fallback Link -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; font-weight: 600;">Button not working? Copy and paste this link in your browser:</p>
                <p style="margin: 0; font-size: 11px; word-break: break-all; color: #0284c7;">
                  <a href="${resetLink}" style="color: #0284c7; text-decoration: underline;">${resetLink}</a>
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                ⏳ This recovery link will expire in <strong>60 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} Assessly. Higher Education Exit Exam Platform.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return sendEmail({
    to: toEmail,
    subject: "Reset Your Assessly Password",
    text: `Hello ${recipientName || "Candidate"},\n\nWe received a request to reset your Assessly account password. Use this link to set a new password: ${resetLink}\n\nThis link expires in 60 minutes. If you did not make this request, please ignore this email.`,
    html,
  });
}
