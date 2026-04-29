const baseStyles = `
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	max-width: 600px;
	margin: 0 auto;
	padding: 20px;
`;

const cardStyles = `
	background: #ffffff;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	padding: 32px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const buttonStyles = `
	display: inline-block;
	padding: 12px 24px;
	background: #4f46e5;
	color: #ffffff;
	text-decoration: none;
	border-radius: 6px;
	font-weight: 600;
	margin: 20px 0;
`;

const baseHead = `
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
`;

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html>
${baseHead}
<body style="${baseStyles}">
	<div style="${cardStyles}">
		${content}
	</div>

	<div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
		<p>© ${new Date().getFullYear()} Inkspire. All rights reserved.</p>
	</div>
</body>
</html>
`;

export const verificationTemplate = (
	username: string,
	verificationLink: string,
) => {
	const content = `
		<h1 style="color: #1f2937; text-align: center; margin-top: 0;">
			Welcome to Inkspire!
		</h1>

		<p style="color: #6b7280; text-align: center; font-size: 16px;">
			Hi ${username}, verify your account to get started.
		</p>

		<div style="text-align: center; margin: 32px 0;">
			<a href="${verificationLink}" style="${buttonStyles}">
				Verify Account
			</a>
		</div>

		<p style="color: #9ca3af; text-align: center; font-size: 14px;">
			This link expires in 10 minutes.
		</p>

		<p style="color: #9ca3af; text-align: center; font-size: 14px;">
			If you didn’t create an account, you can safely ignore this email.
		</p>
	`;

	return baseLayout(content);
};

export const passwordResetTemplate = (username: string, resetLink: string) => {
	const content = `
		<h1 style="color: #1f2937; text-align: center; margin-top: 0;">
			Password Reset Request
		</h1>

		<p style="color: #6b7280; font-size: 16px;">
			Hi ${username},
		</p>

		<p style="color: #6b7280; font-size: 16px;">
			We received a request to reset your password. Click below:
		</p>

		<div style="text-align: center; margin: 32px 0;">
			<a href="${resetLink}" style="${buttonStyles}">
				Reset Password
			</a>
		</div>

		<div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0;">
			<p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 600;">
				⚠️ Security Notice
			</p>
			<p style="color: #991b1b; font-size: 14px; margin-top: 8px;">
				This link expires in 1 hour. If you didn’t request this, ignore this email.
			</p>
		</div>
	`;

	return baseLayout(content);
};

export const welcomeTemplate = (username: string) => {
	const content = `
		<div style="text-align: center; margin-bottom: 24px;">
			<span style="font-size: 48px;">🎉</span>
		</div>

		<h1 style="color: #1f2937; text-align: center; margin-top: 0;">
			Welcome to Inkspire!
		</h1>

		<p style="color: #6b7280; font-size: 16px; text-align: center;">
			Hi ${username}, we're thrilled to have you on board!
		</p>

		<p style="color: #6b7280; font-size: 16px; text-align: center;">
			Start exploring and discover amazing content created by our community.
		</p>

		<div style="text-align: center; margin: 32px 0;">
			<a href="${process.env.APP_URL || "https://inkspire.com"}" style="${buttonStyles}">
				Get Started
			</a>
		</div>
	`;

	return baseLayout(content);
};

export const resetSuccessfulTemplate = (username: string) => {
	const content = `
		<h1 style="color: #1f2937; text-align: center; margin-top: 0;">
			Password Reset Successful
		</h1>

		<p style="color: #6b7280; font-size: 16px; text-align: center;">
			Hi ${username},
		</p>

		<p style="color: #6b7280; font-size: 16px; text-align: center;">
			Your password has been successfully updated.
		</p>

		<div style="background: #ecfeff; border-left: 4px solid #06b6d4; padding: 16px; margin: 24px 0;">
			<p style="color: #0e7490; font-size: 14px; margin: 0; font-weight: 600;">
				🔐 Security Tip
			</p>
			<p style="color: #0e7490; font-size: 14px; margin-top: 8px;">
				If you did not perform this action, reset your password immediately, or reach out to our support team.
			</p>
		</div>

		<div style="text-align: center; margin: 32px 0;">
			<a href="${process.env.APP_URL || "https://inkspire.com"}" style="${buttonStyles}">
				Log In
			</a>
		</div>
	`;

	return baseLayout(content);
};
