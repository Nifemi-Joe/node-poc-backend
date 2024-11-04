// routes/authRoutes.js

const express = require('express');
const { registerUser, verifyOtp, googleLogin, login, forgotPassword } = require('../controllers/authController');
const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerUser);

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', verifyOtp);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', login);

// @desc    Login with Google
// @route   POST /api/auth/google
// @access  Public
router.post('/google', googleLogin);

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', forgotPassword);

module.exports = router;
