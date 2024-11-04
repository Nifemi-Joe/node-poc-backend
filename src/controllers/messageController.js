const Message = require('../models/Message');

// Post a message in chat
exports.postMessage = async (req, res) => {
	const { complaintId, text } = req.body;
	const message = new Message({
		complaintId,
		sender: req.user.id,
		text,
		createdAt: new Date()
	});
	await message.save();
	res.status(201).json({ message: 'Message sent', message });
};
