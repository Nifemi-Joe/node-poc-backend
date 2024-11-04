// reportController.js
const Complaint = require('../models/Complaint'); // Assuming complaint model is in a models folder
const mongoose = require('mongoose');
const moment = require('moment'); // For date manipulation (install this package if needed)

// Error handling utility (create custom error handlers as needed)
const asyncHandler = require('../middlewares/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc Generate complaint reports based on daily, monthly, or yearly filters
 * @route GET /api/v1/reports/:type
 * @access Admin
 */
exports.generateReport = asyncHandler(async (req, res, next) => {
	const { type } = req.params; // Type can be 'daily', 'monthly', or 'yearly'
	const { status, priority } = req.query; // Optional filters for status and priority

	// Validate report type
	const validTypes = ['daily', 'monthly', 'yearly'];
	if (!validTypes.includes(type)) {
		return next(new ErrorResponse('Invalid report type', 400));
	}

	// Set date range based on type
	let startDate;
	switch (type) {
		case 'daily':
			startDate = moment().startOf('day').toDate();
			break;
		case 'monthly':
			startDate = moment().startOf('month').toDate();
			break;
		case 'yearly':
			startDate = moment().startOf('year').toDate();
			break;
		default:
			return next(new ErrorResponse('Unsupported report type', 400));
	}

	// Construct the query filter with optional status and priority
	const filter = { createdAt: { $gte: startDate } };
	if (status) filter.status = status;
	if (priority) filter.priority = priority;

	// Fetch complaints with aggregation for report metrics
	const complaints = await Complaint.aggregate([
		{ $match: filter },
		{
			$group: {
				_id: { status: "$status", priority: "$priority" },
				total: { $sum: 1 },
				complaints: { $push: "$$ROOT" }
			}
		},
		{
			$project: {
				_id: 0,
				status: "$_id.status",
				priority: "$_id.priority",
				total: 1,
				complaints: {
					subject: 1,
					complaintAgainst: 1,
					createdAt: 1,
					assignedTo: 1,
					messages: { $size: "$messages" },
				}
			}
		}
	]);

	res.status(200).json({
		success: true,
		reportType: type,
		totalComplaints: complaints.length,
		details: complaints
	});
});

/**
 * @desc Get summary report counts for daily, monthly, and yearly at once
 * @route GET /api/v1/reports/summary
 * @access Admin
 */
exports.getReportSummary = asyncHandler(async (req, res, next) => {
	// Date ranges for daily, monthly, and yearly
	const dailyStart = moment().startOf('day').toDate();
	const monthlyStart = moment().startOf('month').toDate();
	const yearlyStart = moment().startOf('year').toDate();

	// Count complaints for each range
	const [dailyCount, monthlyCount, yearlyCount] = await Promise.all([
		Complaint.countDocuments({ createdAt: { $gte: dailyStart } }),
		Complaint.countDocuments({ createdAt: { $gte: monthlyStart } }),
		Complaint.countDocuments({ createdAt: { $gte: yearlyStart } })
	]);

	res.status(200).json({
		success: true,
		summary: {
			daily: dailyCount,
			monthly: monthlyCount,
			yearly: yearlyCount
		}
	});
});

/**
 * @desc Export complaint report as CSV
 * @route GET /api/v1/reports/export/:type
 * @access Admin
 */
exports.exportReportCSV = asyncHandler(async (req, res, next) => {
	const { type } = req.params;
	const validTypes = ['daily', 'monthly', 'yearly'];
	if (!validTypes.includes(type)) {
		return next(new ErrorResponse('Invalid export type', 400));
	}

	// Set date range for export
	let startDate;
	switch (type) {
		case 'daily': startDate = moment().startOf('day').toDate(); break;
		case 'monthly': startDate = moment().startOf('month').toDate(); break;
		case 'yearly': startDate = moment().startOf('year').toDate(); break;
	}

	// Retrieve complaints
	const complaints = await Complaint.find({ createdAt: { $gte: startDate } });

	// Prepare CSV data
	const csvHeaders = 'Subject, Status, Priority, Created At, Assigned To\n';
	const csvRows = complaints.map(c => {
		return `${c.subject}, ${c.status}, ${c.priority}, ${c.createdAt}, ${c.assignedTo || 'N/A'}`;
	});

	// Send CSV file as response
	res.header('Content-Type', 'text/csv');
	res.attachment(`${type}_report.csv`);
	res.send(csvHeaders + csvRows.join('\n'));
});
