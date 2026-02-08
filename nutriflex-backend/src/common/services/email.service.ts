import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

/**
 * Email service for sending transactional emails (verification, notifications, etc.)
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor() {
    // Initialize nodemailer transporter if SMTP config is available
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@nutriflex.com';

    if (smtpHost && smtpPort && smtpUser && smtpPassword) {
      this.transporter = createTransport({
        host: smtpHost,
        port: Number(smtpPort),
        secure: Number(smtpPort) === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
      this.logger.log('Email service initialized with SMTP configuration');
    } else {
      this.logger.warn(
        'Email service not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in .env to enable email sending.',
      );
    }
  }

  /**
   * Send email verification link to user
   */
  async sendVerificationEmail(email: string, fullName: string, token: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Email verification skipped (no SMTP config). Token for ${email}: ${token}`);
      return;
    }

    const baseUrl = process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@nutriflex.com',
      to: email,
      subject: 'Verify your email address - Nutriflex',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background-color: #0056b3; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Nutriflex, ${fullName}!</h2>
            <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Nutriflex, ${fullName}!
        
        Thank you for signing up. Please verify your email address by visiting this link:
        ${verificationLink}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, please ignore this email.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error instanceof Error ? error.stack : error);
      // Don't throw - allow sign-up to succeed even if email fails
      // In production, you might want to queue emails or handle failures differently
    }
  }
}
