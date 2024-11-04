// middlewares/validateFields.js

const ErrorResponse = require('../utils/ErrorResponse');

const validateFields = (model, requiredFields) => {
	return (req, res, next) => {
		const missingFields = requiredFields.filter(field => !req.body[field]);

		if (missingFields.length) {
			return next(new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, '400', '22'));
		}
		next();
	};
};

module.exports = validateFields;
