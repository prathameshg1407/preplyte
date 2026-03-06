import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// ============================================
// Configuration
// ============================================

const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER;
const APP_NAME = 'Preplyte';

// ============================================
// Email Service
// ============================================

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      logger.warn('Email service not configured. SMTP credentials missing.', {
        hasUser: !!EMAIL_CONFIG.auth.user,
        hasPass: !!EMAIL_CONFIG.auth.pass,
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
      });
      return;
    }

    try {
      this.transporter = nodemailer.createTransport(EMAIL_CONFIG);
      logger.info('Email service initialized successfully', {
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        secure: EMAIL_CONFIG.secure,
        user: EMAIL_CONFIG.auth.user,
      });
    } catch (error: any) {
      logger.error('Failed to initialize email service', { 
        error: error.message,
        stack: error.stack,
      });
    }
  }

  async sendOTP(email: string, otp: string): Promise<boolean> {
    if (!this.transporter) {
      logger.error('Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${APP_NAME}" <${FROM_EMAIL}>`,
        to: email,
        subject: `Your ${APP_NAME} Verification Code`,
        html: this.getOTPEmailTemplate(otp),
      };

      logger.info('Attempting to send OTP email', { 
        to: email, 
        from: FROM_EMAIL,
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
      });

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('OTP email sent successfully', { 
        email, 
        messageId: info.messageId,
        response: info.response,
      });
      return true;
    } catch (error: any) {
      logger.error('Failed to send OTP email', { 
        email, 
        error: error.message,
        code: error.code,
        command: error.command,
        stack: error.stack,
      });
      return false;
    }
  }

  private getOTPEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">${APP_NAME}</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                        Thank you for registering with ${APP_NAME}! To complete your registration, please use the verification code below:
                      </p>
                      
                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <div style="background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; display: inline-block;">
                              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                ${otp}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
                        This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated email. Please do not reply to this message.
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                        © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
