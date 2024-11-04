// app.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware'); // Custom error handlers

// Load environment variables from .env file
dotenv.config();
const uri = process.env.MONGO_URI || "uriii"
// Connect to MongoDB
const connectDB = async () => {
	try {
		await mongoose.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('MongoDB connected');
	} catch (error) {
		console.error(`MongoDB connection error: ${error.message}`);
		process.exit(1);
	}
};

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(helmet()); // Set security headers
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Log requests to console
app.use(rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
}));

// Connect to database
connectDB();

// Route imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');


// Route middleware
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/user', userRoutes);
app.use('/api/report', reportRoutes);


// Error handling middleware
app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Handle other errors

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
	console.log(uri)
	console.log(`Server is running on port ${PORT}`);
});
