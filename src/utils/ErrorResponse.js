// utils/ErrorResponse.js

class ErrorResponse {
	constructor(message, statusCode, errorCode) {
		this.message = message;
		this.statusCode = statusCode;
		this.errorCode = errorCode;
	}

	getFormattedResponse() {
		return {
			responseMessage: this.message,
			responseCode: this.statusCode,
			errorCode: this.errorCode,
		};
	}
}

module.exports = ErrorResponse;
