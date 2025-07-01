// utils/email.server.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(to: string, resetUrl: string) {
  try {
    const result = await resend.emails.send({
      from: "security@yourdomain.com",
      to,
      subject: "Password Reset Request for Your Account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    max-width: 150px;
                    margin-bottom: 20px;
                }
                .content {
                    background-color: #f9f9f9;
                    padding: 25px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #2563eb;
                    color: white !important;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 500;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                    margin-top: 30px;
                }
                .divider {
                    border-top: 1px solid #e5e7eb;
                    margin: 20px 0;
                }
                .code {
                    font-family: monospace;
                    background-color: #f3f4f6;
                    padding: 2px 4px;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="https://yourdomain.com/logo.png" alt="Company Logo" class="logo">
                <h1>Password Reset</h1>
            </div>
            
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
                
                <p>To reset your password, click the button below:</p>
                
                <p style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </p>
                
                <p>Or copy and paste this link into your browser:</p>
                <p class="code">${resetUrl}</p>
                
                <div class="divider"></div>
                
                <p><strong>This link will expire in 15 minutes</strong> for your security.</p>
                <p>If you're having trouble with the button above, please contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                <p>
                    <a href="https://yourdomain.com" style="color: #666; text-decoration: none;">Home</a> | 
                    <a href="https://yourdomain.com/privacy" style="color: #666; text-decoration: none;">Privacy Policy</a> | 
                    <a href="https://yourdomain.com/contact" style="color: #666; text-decoration: none;">Contact Us</a>
                </p>
            </div>
        </body>
        </html>
      `,
      text: `Password Reset Request\n\nWe received a request to reset your password. If you didn't make this request, you can safely ignore this email.\n\nTo reset your password, visit this link:\n${resetUrl}\n\nThis link will expire in 15 minutes for your security.\n\n© ${new Date().getFullYear()} Your Company Name. All rights reserved.`,
    });

    console.log("📬 Email sent successfully to:", to);
    return { success: true, data: result };
  } catch (err) {
    console.error("❌ Failed to send reset email:", err);
    return { success: false, error: err };
  }
}