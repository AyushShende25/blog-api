import nodemailer from "nodemailer";

import { env } from "@/config/env";
import {
  getVerificationTemplate,
  getWelcomeTemplate,
} from "@/utils/emailTemplates";

class Email {
  private to: string;
  private username: string;
  private from: string;

  constructor({ username, to }: { username: string; to: string }) {
    this.to = to;
    this.username = username;
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
    const html = getVerificationTemplate(this.username, code);
    await this.send(html, "Verify your account");
  }

  async sendWelcome() {
    const html = getWelcomeTemplate(this.username);
    await this.send(html, "Welcome to Inkspire!");
  }
}

export default Email;
