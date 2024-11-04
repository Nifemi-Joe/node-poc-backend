// messageModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
	complaintId: {
		type: Schema.Types.ObjectId,
		ref: 'Complaint',          // References the complaint this message belongs to
		required: true
	},
	sender: {
		type: Schema.Types.ObjectId,
		ref: 'User',               // References the user sending the message
		required: true
	},
	text: {
		type: String,
		required: true,
		trim: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	isInternal: {
		type: Boolean,
		default: false              // Indicates if this is an internal message (for employee-only notes)
	}
});

module.exports = mongoose.model('Message', messageSchema);
