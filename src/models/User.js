// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	middleName: String,
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['customer', 'admin', 'superadmin', 'officer'], default: 'customer' },
	status: { type: String, enum: ['active', 'inactive', 'banned',  'pending'], default: 'active' },
	phone: String,
	picture: String,
}, { timestamps: true });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
// 	if (!this.isModified('password')) return next();
// 	this.password = await bcrypt.hash(this.password, 10);
// 	next();
// });

module.exports = mongoose.model('User', userSchema);
