// routes/complaintRoutes.js

const express = require('express');
const { authorizeRoles, isAuthenticated } = require('../middlewares/roleMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');
const { generateReport } = require('../controllers/reportController');

const router = express.Router();

router.get(
	'/report/:type',
	isAuthenticated,
	authorizeRoles('admin', 'superadmin'),
	asyncHandler(generateReport)
);

module.exports = router;
