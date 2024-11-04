// controllers/authController.js

const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const { sendEmail } = require('../services/emailService');
const otpService = require('../services/otpService');
const googleAuthService = require('../services/googleAuthService');
const User = require('../models/User'); // Assuming a User model exists for database operations
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validateFields = require('../middlewares/validateFields');
const argon2 = require('argon2');


// Define required fields for user registration
const userRegistrationFields = ['firstName', 'lastName', 'email', 'password'];
const loginFields = ['email', 'password'];
const otpFields = ['email', 'otp'];
const forgotFields = ['email'];
const resetFields = ['email', 'otp', 'password', 'confirmPassword' ];

// Register user and send OTP
exports.registerUser = [validateFields(User, userRegistrationFields), asyncHandler(async (req, res, next) => {
	const { firstName, lastName, middleName, email } = req.body;
// Hash password
	const salt = await bcrypt.genSalt(10);

	const hashedPassword = await argon2.hash(req.body.password);
	console.log(`Comparing Password: ${req.body.password.toString()} with ${hashedPassword}`);

	// Check if user already exists
	let user = await User.findOne({ email });
	if (user) {
		return next(new ErrorResponse('User already exists', 200, '22'));
	}


	const otp = otpService.generateOtp(email);

	try {
		await sendEmail({
			to: email,
			subject: 'Verify Your Email',
			text: `Your OTP for email verification is ${otp}.`,
			html: `<p>Your OTP for email verification is <strong>${otp}</strong>.</p>`,
		});

		// Create user with status 'Pending Verification' only if email was sent successfully
		user = await User.create({
			firstName,
			lastName,
			middleName,
			email,
			password: hashedPassword,
			status: 'pending',
		});

		if (!user) {
			return next(new ErrorResponse('Unable to create user', 400, '22'));
		}

		res.status(202).json({
			responseCode: '00',
			responseMessage: 'Registration successful, verification email sent',
		});

	} catch (error) {
		// Handle email sending failure
		console.error('Error sending email:', error);
		return next(new ErrorResponse('Failed to send verification email', 500, '22'));
	}
})];

// Verify OTP for email
exports.verifyOtp =[validateFields(User, otpFields),  asyncHandler(async (req, res, next) => {
	const { email, otp } = req.body;

	// Verify OTP validity
	const isValidOtp = otpService.verifyOtp(email, otp);
	if (!isValidOtp) {
		return next(new ErrorResponse('Invalid OTP', 400, '22'));
	}

	// Update user status to 'Active'
	const user = await User.findOneAndUpdate(
		{ email },
		{ status: 'active' },
		{ new: true }
	);

	if (!user) {
		return next(new ErrorResponse('User not found', 400, '22'));
	}

	res.status(200).json({
		responseCode: '00',
		responseMessage: 'OTP verified successfully, user activated',
	});
})];

// Login with email and password
exports.login = [validateFields(User, loginFields), asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;

	// Find user
	const user = await User.findOne({ email });
	if (!user || user.status !== 'active') {
		return next(new ErrorResponse('Invalid credentials or inactive user', 202, '22'));
	}


	// Check password
	const isMatch = await argon2.verify(user.password, password);
	console.log(`Comparing Password: ${password} with ${user.password}`);

	if (!isMatch) {
		return next(new ErrorResponse('Invalid credentials', 401, '22'));
	}

	// Generate JWT token
	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: 216000000,
	});

	res.status(200).json({
		responseCode: '00',
		responseMessage: 'Login successful',
		responseData: user,
		token,
	});
})];

// Login with Google
exports.googleLogin = asyncHandler(async (req, res, next) => {
	const { token } = req.body;

	// Verify Google token
	const googleProfile = await googleAuthService.verifyGoogleToken(token);
	if (!googleProfile) {
		return next(new ErrorResponse('Invalid Google token', '22', '22'));
	}

	// Authenticate or register user based on Google profile
	const user = await googleAuthService.authenticateUser(googleProfile);

	// Generate JWT token
	const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

	res.status(200).json({
		responseCode: '00',
		responseMessage: 'User authenticated successfully via Google',
		token: jwtToken,
	});
});

// Forgot password - initiate by sending OTP
exports.forgotPassword = [validateFields(User, forgotFields), asyncHandler(async (req, res, next) => {
	const { email } = req.body;

	// Check if user exists
	const user = await User.findOne({ email });
	if (!user) {
		return next(new ErrorResponse('User not found', 404, '22'));
	}

	// Generate and send OTP
	const otp = otpService.generateOtp(email);
	await sendEmail({
		to: email,
		subject: 'Reset Your Password',
		text: `Your OTP for password reset is ${otp}.`,
		html: `<p>Your OTP for password reset is <strong>${otp}</strong>.</p>`,
	});

	res.status(200).json({
		responseCode: '00',
		responseMessage: 'OTP sent for password reset',
	});
})];

// Reset password using OTP
exports.resetPassword = [validateFields(User, resetFields), asyncHandler(async (req, res, next) => {
	const { email, otp, password, confirmPassword } = req.body;

	// Check if passwords match
	if (password !== confirmPassword) {
		return next(new ErrorResponse('Passwords do not match', 400, 400));
	}

	// Verify OTP
	const isValidOtp = otpService.verifyOtp(email, otp);
	if (!isValidOtp) {
		return next(new ErrorResponse('Invalid OTP', 400, 400));
	}

	// Hash new password
	const hashedPassword = await bcrypt.hash(password, 10);

	// Update user password
	const user = await User.findOneAndUpdate(
		{ email },
		{ password: hashedPassword },
		{ new: true }
	);

	if (!user) {
		return next(new ErrorResponse('User not found', 404, '22'));
	}

	res.status(200).json({
		responseCode: '00',
		responseMessage: 'Password reset successful',
	});
})];
