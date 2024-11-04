// services/emailService.js

const nodemailer = require('nodemailer');
const ErrorResponse = require('../utils/ErrorResponse');

const transporter = nodemailer.createTransport({
	service: process.env.EMAIL_SERVICE,
	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD,
	},
});

/**
 * Sends an email with the provided options.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text body of the email.
 * @param {string} html - The HTML content of the email.
 * @returns {Promise<void>}
 */
const sendEmail = async ({ to, subject, text, html }) => {
	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to,
		subject,
		text,
		html,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log('Email sent successfully');
	} catch (error) {
		console.error('Error sending email:', error);
		throw new ErrorResponse('Email could not be sent', 500, '22');
	}
};

module.exports = { sendEmail };
