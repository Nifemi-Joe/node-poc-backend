// roleMiddleware.js
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

/**
 * @desc Middleware to check if the user's role is authorized for the requested route
 * @param {...string} roles - List of roles allowed to access the route
 * @returns {function} Middleware function
 */
const authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			// User is either not authenticated or lacks necessary permissions
			return next(new ErrorResponse('Not authorized to access this route', 202));
		}
		next();
	};
};

/**
 * @desc Middleware to ensure the user is authenticated before accessing a protected route
 * @returns {function} Middleware function
 */
const isAuthenticated = async (req, res, next) => {
	let token;

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		try {
			token = req.headers.authorization.split(' ')[1];
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			req.user = await User.findById(decoded.id).select('-password');

			if (!req.user) {
				return res.status(202).json({
					responseCode: "22",
					responseMessage: "Not authorized, user not found"
				});
			}

			return next();  // Only proceed if user is authenticated
		} catch (error) {
			console.error(error);
			return res.status(202).json({
				responseCode: "22",
				responseMessage: "Not authorized, user not found"
			});
		}
	}

	if (!token) {
		return res.status(202).json({
			responseCode: "22",
			responseMessage: "Not authorized, user not found"
		});
	}
};

module.exports = { authorizeRoles, isAuthenticated };
