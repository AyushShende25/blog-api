import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/config/env";
import {
	passwordResetTemplate,
	resetSuccessfulTemplate,
	verificationTemplate,
	welcomeTemplate,
} from "@/jobs/email/emailTemplates";

class EmailService {
	private transporter: Transporter;
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: env.EMAIL_HOST,
			port: env.EMAIL_PORT,
			auth: {
				user: env.EMAIL_USERNAME,
				pass: env.EMAIL_PASSWORD,
			},
		});
	}

	private send(to: string, subject: string, html: string) {
		return this.transporter.sendMail({
			from: `Inkspire <${env.EMAIL_FROM}>`,
			to,
			subject,
			html,
		});
	}

	sendVerification(to: string, username: string, verificationLink: string) {
		return this.send(
			to,
			"Verify your account",
			verificationTemplate(username, verificationLink),
		);
	}

	sendPasswordReset(to: string, username: string, resetLink: string) {
		return this.send(
			to,
			"Reset your Inkspire password",
			passwordResetTemplate(username, resetLink),
		);
	}

	sendWelcome(to: string, username: string) {
		return this.send(to, "Welcome to Inkspire", welcomeTemplate(username));
	}

	sendResetSuccess(to: string, username: string) {
		return this.send(
			to,
			"Password reset successfull",
			resetSuccessfulTemplate(username),
		);
	}
}

export default new EmailService();
