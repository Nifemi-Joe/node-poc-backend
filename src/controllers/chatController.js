// src/controllers/chatController.js
const { Server } = require('socket.io');

const chatHandler = (server) => {
	const io = new Server(server, { cors: { origin: '*' } });

	io.on('connection', (socket) => {
		console.log("User connected:", socket.id);

		socket.on('joinComplaintRoom', (complaintId) => {
			socket.join(complaintId);
		});

		socket.on('sendMessage', (data) => {
			const { complaintId, message, sender } = data;
			io.to(complaintId).emit('newMessage', { message, sender });
		});

		socket.on('disconnect', () => {
			console.log("User disconnected:", socket.id);
		});
	});
};

module.exports = chatHandler;
