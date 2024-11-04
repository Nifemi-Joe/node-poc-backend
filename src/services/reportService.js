// services/reportService.js

const Complaint = require('../models/Complaint'); // Assuming a Complaint model exists
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * Generates a report for complaints based on timeframe.
 * @param {string} timeframe - 'daily', 'monthly', or 'yearly'
 * @returns {Promise<object>} Report data
 */
const generateComplaintReport = async (timeframe) => {
	try {
		const date = new Date();
		let startDate;

		switch (timeframe) {
			case 'daily':
				startDate = new Date(date.setHours(0, 0, 0, 0));
				break;
			case 'monthly':
				startDate = new Date(date.getFullYear(), date.getMonth(), 1);
				break;
			case 'yearly':
				startDate = new Date(date.getFullYear(), 0, 1);
				break;
			default:
				throw new ErrorResponse('Invalid timeframe', 400, '22');
		}

		const complaints = await Complaint.find({ createdAt: { $gte: startDate } });
		const report = {
			totalComplaints: complaints.length,
			byStatus: complaints.reduce((acc, complaint) => {
				acc[complaint.status] = (acc[complaint.status] || 0) + 1;
				return acc;
			}, {}),
			byPriority: complaints.reduce((acc, complaint) => {
				acc[complaint.priority] = (acc[complaint.priority] || 0) + 1;
				return acc;
			}, {}),
		};

		return report;
	} catch (error) {
		console.error('Error generating report:', error);
		throw new ErrorResponse('Report generation failed', 500, '22');
	}
};

module.exports = { generateComplaintReport };
