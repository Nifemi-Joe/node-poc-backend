// src/controllers/UserController.js
const User = require('../models/User');

// Change user role (admin only)
exports.changeRole = async (req, res) => {
	const { userId, newRole } = req.body;
	const user = await User.findById(userId);
	if (!user) return res.status(404).json({ message: 'User not found' });

	user.role = newRole;
	await user.save();
	res.status(200).json({ message: `User role updated to ${newRole}`, user });
};

// Get user by ID
exports.getUserById = async (req, res) => {
	try {
		const userId = req.params.id;
		const user = await User.findById(userId).select('-password'); // Exclude password from response
		if (!user) {
			return res.status(202).json({ responseCode: "22", responseMessage: 'User not found' });
		}
		res.status(200).json({ responseCode: "00", responseMessage: 'Completed successfully.', responseData: user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ responseCode: "22", responseMessage: 'User not found' });
	}
};
