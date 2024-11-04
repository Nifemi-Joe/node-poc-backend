// src/controllers/complaintController.js
const Complaint = require('../models/Complaint');
const ErrorResponse = require('../utils/ErrorResponse');
const validateFields = require('../middlewares/validateFields');

// Define required fields for user registration
const createFields = ['subject', 'complaintAgainst', 'description'];
const updatFields = ['email', 'password'];

exports.createComplaint = [
	validateFields(Complaint, createFields),
	async (req, res, next) => {
		try {
			const complaint = await Complaint.create({ ...req.body, customer: req.user._id });
			res.status(201).json({
				responseCode: "00",
				responseMessage: "Completed Successfully.",
				responseData: complaint,
			});
		} catch (error) {
			console.log(error);
			return res.status(400).json({
				responseCode: "22",
				responseMessage: "Something went wrong",
			});
		}
	},
];

exports.bulkCreateComplaints = async (req, res) => {
	try {
		const complaints = req.body; // This should be an array of complaint objects
		complaints.forEach((complaint)=> {
			complaint.customer = req.user._id
		})
		// Validate the array format
		if (!Array.isArray(complaints)) {
			return res.status(400).json({ error: 'Input should be an array of complaints' });
		}
		// Insert all complaints at once
		const createdComplaints = await Complaint.insertMany(complaints);

		res.status(201).json({ responseCode: "00", responseMessage: 'Complaints uploaded successfully', responseData: createdComplaints });
	} catch (error) {
		console.error(error);
		res.status(500).json({ responseCode: "22", responseMessage: 'Failed to upload complaints' });
	}
};

exports.assignComplaint = async (req, res, next) => {
	try {
		const { complaintId, employeeId, internalNote } = req.body;
		const complaint = await Complaint.findByIdAndUpdate(
			complaintId,
			{ $push: { internalNotes: { note: internalNote, sender: req.user.id } } },
			{ new: true }
		);
		res.status(200).json({ complaint });
	} catch (error) {
		next(new ErrorResponse('Error retrieving complaints', 500, '22'));
	}
};


// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin and Officer roles)
exports.getComplaints = async (req, res, next) => {
	try {
		const { role, _id } = req.user;
		let complaints;

		if (role === 'customer') {
			complaints = await Complaint.find({ customer: _id });
		} else if (role === 'officer') {
			complaints = await Complaint.find({ assignedTo: _id });
		} else {
			complaints = await Complaint.find();
		}

		res.status(200).json({
			responseCode: '00',
			responseMessage: 'Complaints retrieved successfully',
			responseData: complaints,
		});
	} catch (error) {
		res.status(500).json({ responseCode: "22", responseMessage: 'Failed to retrive complaints' });
	}
};

// @desc    Update a complaint
// @route   PATCH /api/complaints/:id
// @access  Private (Admin and Officer roles)
exports.updateComplaint = async (req, res, next) => {
	try {
		const { title, description, status } = req.body;
		const { id } = req.params;

		const complaint = await Complaint.findByIdAndUpdate(id, {
			title,
			description,
			status,
		}, { new: true });

		if (!complaint) {
			return next(new ErrorResponse('Complaint not found', 404, '22'));
		}

		res.status(200).json({
			responseCode: '00',
			responseMessage: 'Complaint updated successfully',
			complaint,
		});
	} catch (error) {
		next(new ErrorResponse('Error updating complaint', 500, '22'));
	}
};

// @desc    Delete a complaint (soft delete)
// @route   DELETE /api/complaints/:id
// @access  Private (Admin and Officer roles)
exports.deleteComplaint = async (req, res, next) => {
	try {
		const { id } = req.params;

		const complaint = await Complaint.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

		if (!complaint) {
			return next(new ErrorResponse('Complaint not found', 404, '22'));
		}

		res.status(200).json({
			responseCode: '00',
			responseMessage: 'Complaint deleted successfully',
			complaint,
		});
	} catch (error) {
		next(new ErrorResponse('Error deleting complaint', 500, '22'));
	}
};

// @desc    Reply to a complaint
// @route   POST /api/complaints/:id/reply
// @access  Private (Officer role)
exports.replyToComplaint = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { reply } = req.body;

		const complaint = await Complaint.findById(id);

		if (!complaint) {
			return next(new ErrorResponse('Complaint not found', 404, '22'));
		}

		complaint.replies.push({
			user: req.user.id,
			reply,
			createdAt: Date.now(),
		});

		await complaint.save();

		res.status(200).json({
			responseCode: '00',
			responseMessage: 'Reply added successfully',
			complaint,
		});
	} catch (error) {
		next(new ErrorResponse('Error replying to complaint', 500, '22'));
	}
};

// @desc    Add an internal note to a complaint
// @route   POST /api/complaints/:id/internal-note
// @access  Private (Admin and Officer roles)
exports.addInternalNote = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { note } = req.body;

		const complaint = await Complaint.findById(id);

		if (!complaint) {
			return next(new ErrorResponse('Complaint not found', 404, '22'));
		}

		complaint.internalNotes.push({
			user: req.user.id,
			note,
			createdAt: Date.now(),
		});

		await complaint.save();

		res.status(200).json({
			responseCode: '00',
			responseMessage: 'Internal note added successfully',
			complaint,
		});
	} catch (error) {
		next(new ErrorResponse('Error adding internal note', 500, '22'));
	}
};

exports.readComplaintById = async (req, res) => {
	try {
		const { id } = req.params; // Get the ID from the request parameters
		if (!id) {
			return res.status(400).json({ message: "Complaint ID is required" });
		}

		// Find the complaint by ID
		const complaint = await Complaint.findById(id);
		if (!complaint) {
			return res.status(404).json({ message: "Complaint not found" });
		}

		// Send the complaint data as the response
		res.status(200).json({
			success: true,
			data: complaint
		});
	} catch (error) {
		console.error("Error reading complaint by ID:", error.message);
		res.status(500).json({
			success: false,
			message: "An error occurred while fetching the complaint"
		});
	}
};
