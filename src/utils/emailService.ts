import nodemailer from "nodemailer";

import { env } from "@/config/env";
import type { User } from "@prisma/client";

class Email {
  private to: string;
  private username: string;
  private from: string;

  constructor(user: User) {
    this.to = user.email;
    this.username = user.username;
    this.from = `Inkspire - <${env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      auth: {
        user: env.EMAIL_USERNAME,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }

  async send(html: string, subject: string) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };
    //create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendVerificationCode(code: string) {
    await this.send(
      `    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #333333; text-align: center;">Welcome to Inkspire, ${this.username}!</h2>
  <p style="font-size: 16px; color: #555555; text-align: center;">
    We're excited to have you on board! To verify your account, please use the code below:
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <div style="display: inline-block; background-color: #f4f4f4; color: #333333; font-size: 24px; font-weight: bold; padding: 10px 20px; border: 1px solid #e0e0e0; border-radius: 5px; letter-spacing: 2px;">
      ${code}
    </div>
  </div>
  <p style="font-size: 14px; color: #555555; text-align: center;">
    This code will expire in 10 minutes.
  </p>
  <p style="font-size: 14px; color: #999999; text-align: center;">
    If you did not request this, you can safely ignore this email.
  </p>
  <hr style="border-top: 1px solid #e0e0e0;">
  <p style="font-size: 12px; color: #999999; text-align: center;">
    © 2024 Inkspire. All rights reserved.
  </p>
</div>
      `,
      "Verify your account details",
    );
  }

  async sendWelcome() {
    await this.send(
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #333333; text-align: center;">Welcome to Inkspire, ${this.username}!</h2>
  <p style="font-size: 16px; color: #555555;">
    We're thrilled to have you on board. Inkspire is your platform to share ideas, connect with like-minded individuals, and bring your creativity to life.
  </p>
  <p style="font-size: 14px; color: #999999;">
    If you have any questions or need assistance, feel free to reach out to our support team at any time.
  </p>
  <hr style="border-top: 1px solid #e0e0e0;">
  <p style="font-size: 12px; color: #999999; text-align: center;">
    © 2024 Inkspire. All rights reserved.
  </p>
</div>
`,
      "welcome to Inkspire",
    );
  }
}

export default Email;
