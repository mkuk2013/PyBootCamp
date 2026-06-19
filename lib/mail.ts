// Mail Service with Nodemailer (SMTP relay setup)
import nodemailer from "nodemailer";

interface MailConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
}

const getMailConfig = (): MailConfig => ({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASSWORD,
  from: process.env.SMTP_FROM || '"PyBootCamp" <noreply@pybootcamp.com>',
});

export async function sendApprovalEmail(toEmail: string, userName: string) {
  const config = getMailConfig();
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const mailOptions = {
    from: config.from,
    to: toEmail,
    subject: "Your PyBootCamp Account Has Been Approved!",
    text: `Hello ${userName},\n\nYour PyBootCamp account has been successfully approved! You can now log in and access your coding dashboard at: ${siteUrl}/login\n\nBest regards,\nThe PyBootCamp Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Account Approved - PyBootCamp</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.025em;
          }
          .content {
            padding: 32px;
          }
          .content h2 {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin-top: 0;
          }
          .content p {
            line-height: 1.6;
            font-size: 16px;
            color: #475569;
          }
          .button-container {
            text-align: center;
            margin: 32px 0 24px;
          }
          .btn {
            background-color: #3b82f6;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 32px;
            font-weight: 600;
            border-radius: 8px;
            display: inline-block;
          }
          .footer {
            background-color: #f8fafc;
            padding: 24px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PyBootCamp</h1>
          </div>
          <div class="content">
            <h2>Account Approved!</h2>
            <p>Dear ${userName},</p>
            <p>We are pleased to inform you that your PyBootCamp account has been approved by the administrator.</p>
            <p>You can now log in to access your dashboard, start coding exercises, and track your progress.</p>
            <div class="button-container">
              <a href="${siteUrl}/login" class="btn">Log In to Your Account</a>
            </div>
            <p>If you have any questions or encounter any issues, feel free to reply to this email.</p>
            <p>Best regards,<br>The PyBootCamp Team</p>
          </div>
          <div class="footer">
            &copy; 2026 PyBootCamp. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  // Check if SMTP is configured
  if (!config.host || !config.user || !config.pass) {
    console.log("--------------------------------------------------");
    console.log("[Mail Service] SMTP configuration is incomplete. Skip sending email.");
    console.log(`[Mail Service] Email would have been sent to: ${toEmail}`);
    console.log(`[Mail Service] Template: Account Approved`);
    console.log("--------------------------------------------------");
    return { success: true, mocked: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail Service] Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Mail Service] Error sending email:", error);
    throw error;
  }
}
