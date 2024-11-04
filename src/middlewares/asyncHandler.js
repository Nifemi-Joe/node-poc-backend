// asyncHandler.js

/**
 * @desc Middleware to handle async functions in route handlers
 * @param {function} fn - Asynchronous function (e.g., controller function)
 * @returns {function} Wrapped function with error handling
 */
const asyncHandler = fn => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
