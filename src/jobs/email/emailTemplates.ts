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

const codeStyles = `
	display: inline-block;
	padding: 16px 32px;
	background: #f3f4f6;
	border: 2px solid #e5e7eb;
	border-radius: 8px;
	font-size: 32px;
	font-weight: bold;
	letter-spacing: 8px;
	color: #1f2937;
	font-family: 'Courier New', monospace;
`;

export const verificationTemplate = (username: string, code: string) => `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${baseStyles}">
	<div style="${cardStyles}">
		<h1 style="color: #1f2937; text-align: center; margin-top: 0;">
			Welcome to Inkspire!
		</h1>
		<p style="color: #6b7280; text-align: center; font-size: 16px;">
			Hi ${username}, verify your account to get started.
		</p>
		<div style="text-align: center; margin: 32px 0;">
			<div style="${codeStyles}">${code}</div>
		</div>
		<p style="color: #9ca3af; text-align: center; font-size: 14px; margin-top: 24px;">
			This code expires in 10 minutes.
		</p>
		<p style="color: #9ca3af; text-align: center; font-size: 14px; margin-top: 8px;">
			If you didn't create an account, you can safely ignore this email.
		</p>
	</div>
	<div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
		<p>© ${new Date().getFullYear()} Inkspire. All rights reserved.</p>
	</div>
</body>
</html>
`;

export const passwordResetTemplate = (username: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${baseStyles}">
	<div style="${cardStyles}">
		<h1 style="color: #1f2937; text-align: center; margin-top: 0;">
			Password Reset Request
		</h1>
		<p style="color: #6b7280; font-size: 16px;">
			Hi ${username},
		</p>
		<p style="color: #6b7280; font-size: 16px;">
			We received a request to reset your password. Click the button below to create a new password:
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
			<p style="color: #991b1b; font-size: 14px; margin: 8px 0 0 0;">
				This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
			</p>
		</div>
	</div>
	<div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
		<p>© ${new Date().getFullYear()} Inkspire. All rights reserved.</p>
	</div>
</body>
</html>
`;

export const welcomeTemplate = (username: string) => `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${baseStyles}">
	<div style="${cardStyles}">
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
	</div>
	<div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
		<p>© ${new Date().getFullYear()} Inkspire. All rights reserved.</p>
	</div>
</body>
</html>
`;

export const resetSuccessfulTemplate = (username: string) => `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${baseStyles}">
	<div style="${cardStyles}">
		<div style="text-align: center; margin-bottom: 24px;">
			<span style="font-size: 48px;">✅</span>
		</div>
		<h1 style="color: #1f2937; text-align: center; margin-top: 0;">
			Password Reset Successful
		</h1>
		<p style="color: #6b7280; font-size: 16px; text-align: center;">
			Hi ${username},
		</p>
		<p style="color: #6b7280; font-size: 16px; text-align: center;">
			Your password has been successfully updated. You can now log in using your new password.
		</p>

		<div style="background: #ecfeff; border-left: 4px solid #06b6d4; padding: 16px; margin: 24px 0;">
			<p style="color: #0e7490; font-size: 14px; margin: 0; font-weight: 600;">
				🔐 Security Tip
			</p>
			<p style="color: #0e7490; font-size: 14px; margin: 8px 0 0 0;">
				If you did not perform this action, please reset your password immediately or contact our support team.
			</p>
		</div>

		<div style="text-align: center; margin: 32px 0;">
			<a href="${process.env.APP_URL || "https://inkspire.com"}" style="${buttonStyles}">
				Log In to Inkspire
			</a>
		</div>
	</div>

	<div style="text-align: center; margin-top: 24px; color: #9ca3af; font-size: 12px;">
		<p>© ${new Date().getFullYear()} Inkspire. All rights reserved.</p>
	</div>
</body>
</html>
`;
