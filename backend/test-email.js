/**
 * Email Service Test Script
 * 
 * Usage:
 *   node test-email.js <recipient-email>
 * 
 * Example:
 *   node test-email.js test@example.com
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error('❌ Error: Please provide a recipient email address');
  console.log('Usage: node test-email.js <recipient-email>');
  process.exit(1);
}

// Email configuration from environment
const config = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

console.log('📧 Testing Email Configuration...\n');
console.log('Configuration:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  Secure: ${config.secure}`);
console.log(`  User: ${config.auth.user}`);
console.log(`  From: ${process.env.SMTP_FROM}`);
console.log(`  To: ${recipientEmail}\n`);

// Create transporter
const transporter = nodemailer.createTransport(config);

// Test OTP
const testOTP = '123456';

// Email content
const mailOptions = {
  from: process.env.SMTP_FROM,
  to: recipientEmail,
  subject: 'Test Email - Preplyte OTP Verification',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification Test</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Preplyte</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Test Email - OTP Verification</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                      This is a test email to verify your email configuration is working correctly.
                    </p>
                    
                    <!-- OTP Box -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
                            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                              ${testOTP}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
                      If you received this email, your email service is configured correctly! ✅
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                      This is a test email from Preplyte email service.
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                      © ${new Date().getFullYear()} Preplyte. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `,
};

// Verify connection
console.log('🔍 Verifying SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your SMTP credentials in .env file');
    console.log('2. Verify SMTP_HOST and SMTP_PORT are correct');
    console.log('3. For Gmail: Use App Password, not regular password');
    console.log('4. For Brevo: Use SMTP key from dashboard');
    process.exit(1);
  }

  console.log('✅ SMTP Connection Successful!\n');
  console.log('📤 Sending test email...');

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Failed to send email:', error.message);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log('\n📬 Check your inbox at:', recipientEmail);
    console.log('   (Don\'t forget to check spam folder)');
  });
});
