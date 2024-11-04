// middleware/errorMiddleware.js

const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
	let error = { ...err };

	// Log for development
	console.error(`Error: ${err.message}`);

	// Specific Mongoose errors
	if (err.name === 'CastError') {
		error = new ErrorResponse('Resource not found', 400, '22');
	}

	if (err.code === 11000) {
		error = new ErrorResponse('Duplicate field value entered', 400, '22');
	}

	if (err.name === 'ValidationError') {
		const messages = Object.values(err.errors).map(val => val.message).join(', ');
		error = new ErrorResponse(messages, 400, '22');
	}
	console.log()
	res.status(error.statusCode || 500).json(error.getFormattedResponse ? error.getFormattedResponse() : {
		responseMessage: err.message,
		responseCode: '22'
	});
};

// middlewares/errorMiddleware.js

const notFound = (req, res, next) => {
	res.status(404).json({ message: 'Not Found' });
};


module.exports = { notFound, errorHandler };
