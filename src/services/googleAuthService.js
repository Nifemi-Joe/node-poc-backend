// services/googleAuthService.js

const { OAuth2Client } = require('google-auth-library');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User'); // Assuming a User model exists

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verifies Google token and fetches user profile.
 * @param {string} token - Google OAuth token.
 * @returns {Promise<object>} User profile data.
 */
const verifyGoogleToken = async (token) => {
	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		return payload;
	} catch (error) {
		console.error('Error verifying Google token:', error);
		throw new ErrorResponse('Google authentication failed', 401, '22');
	}
};

/**
 * Registers or logs in the user based on Google profile.
 * @param {object} googleProfile - Profile data returned from Google.
 * @returns {Promise<object>} User data.
 */
const authenticateUser = async (googleProfile) => {
	const { email, name, picture } = googleProfile;
	let user = await User.findOne({ email });

	if (!user) {
		user = await User.create({
			email,
			name,
			picture,
			role: 'customer',
		});
	}
	return user;
};

module.exports = { verifyGoogleToken, authenticateUser };
