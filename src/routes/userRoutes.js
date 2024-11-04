const express = require('express');
const { changeRole, getUserById } = require('../controllers/userController');
const { authorizeRoles, isAuthenticated } = require('../middlewares/roleMiddleware'); // Middleware for protection and role authorization


const router = express.Router();

// @desc    Change user role
// @route   PATCH /api/users/:id/role
// @access  Private (Admin role)
router.patch('/:id/role', isAuthenticated, authorizeRoles('admin'), changeRole);
router.get('/read-by-id/:id', isAuthenticated, getUserById);

module.exports = router;
