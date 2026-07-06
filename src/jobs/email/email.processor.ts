import type { Job } from "bullmq";
import emailService from "@/jobs/email/email.service";
import type { EmailJobData } from "@/jobs/email/email.types";

export const processEmailJob = async (job: Job<EmailJobData>) => {
	const { data } = job;

	switch (data.type) {
		case "verification":
			await emailService.sendVerification(data.email, data.username, data.link);
			break;

		case "password-reset":
			await emailService.sendPasswordReset(
				data.email,
				data.username,
				data.resetLink,
			);
			break;

		case "welcome":
			await emailService.sendWelcome(data.email, data.username);
			break;

		case "reset-success":
			await emailService.sendResetSuccess(data.email, data.username);
			break;

		default:
			throw new Error(`Unknown email job type: ${job.name}`);
	}
};
