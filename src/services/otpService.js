// services/otpService.js

const crypto = require('crypto');
const ErrorResponse = require('../utils/ErrorResponse');

const otpStorage = new Map();

/**
 * Generates a secure OTP and saves it in memory.
 * @param {string} email - The email to associate the OTP with.
 * @returns {string} OTP
 */
const generateOtp = (email) => {
	const otp = crypto.randomInt(100000, 999999).toString();
	otpStorage.set(email, { otp, createdAt: Date.now() });
	return otp;
};

/**
 * Verifies the provided OTP against stored OTP.
 * @param {string} email - The email associated with the OTP.
 * @param {string} otp - The OTP to validate.
 * @returns {boolean} True if OTP is valid, else throws an error.
 */
const verifyOtp = (email, otp) => {
	const record = otpStorage.get(email);
	if (!record) throw new ErrorResponse('OTP not found or expired', 400, '22');

	const isExpired = Date.now() - record.createdAt > 5 * 60 * 1000; // 5 minutes
	if (isExpired || record.otp !== otp) throw new ErrorResponse('Invalid or expired OTP', 400, '22');

	otpStorage.delete(email);
	return true;
};

module.exports = { generateOtp, verifyOtp };
