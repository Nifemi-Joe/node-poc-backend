// src/models/Complaint.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const complaintSchema = new mongoose.Schema({
	customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	subject: String,
	complaintAgainst: String,
	description: { type: String, required: true },
	assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	date: { type: Date, default: Date.now },
	priority: { type: String, enum: ['high', 'medium', 'low', 'urgent'], default: 'low' },
	status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
	attachments: [String],
	termsAndConditions: Boolean,
	messages: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Message'        // References messages associated with the complaint
		}
	],
	internalNotes: [{
		note: String,
		sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		date: { type: Date, default: Date.now }
	}],
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
