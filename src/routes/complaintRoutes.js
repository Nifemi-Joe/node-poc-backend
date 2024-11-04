// routes/complaintRoutes.js

const express = require('express');
const { createComplaint,bulkCreateComplaints, getComplaints, readComplaintById, updateComplaint, deleteComplaint, assignComplaint, replyToComplaint, addInternalNote } = require('../controllers/complaintController');
const { authorizeRoles, isAuthenticated } = require('../middlewares/roleMiddleware'); // Middleware for isAuthenticatedion and role authorization
const router = express.Router();

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Customer role)
router.post('/create', isAuthenticated, createComplaint);
router.post('/bulk-upload', isAuthenticated, bulkCreateComplaints);

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin and Officer roles)
router.get('/read', isAuthenticated, authorizeRoles('admin', 'officer', 'superadmin', 'customer'), getComplaints);

// @desc    Update a complaint
// @route   PATCH /api/complaints/:id
// @access  Private (Admin and Officer roles)
router.patch('/read-by-id/:id', isAuthenticated, authorizeRoles('admin', 'officer', 'superadmin'), readComplaintById);

// @desc    Delete a complaint (soft delete)
// @route   DELETE /api/complaints/:id
// @access  Private (Admin and Officer roles)
router.delete('/delete/:id', isAuthenticated, authorizeRoles('admin', 'officer', 'superadmin'), deleteComplaint);

// @desc    Assign a complaint to an employee
// @route   PATCH /api/complaints/:id/assign
// @access  Private (Admin role)
router.patch('/:id/assign', authorizeRoles('admin', 'officer', 'superadmin'), assignComplaint);

// @desc    Reply to a complaint
// @route   POST /api/complaints/:id/reply
// @access  Private (Officer role)
router.post('/:id/reply', isAuthenticated, authorizeRoles('officer'), replyToComplaint);

// @desc    Add an internal note to a complaint
// @route   POST /api/complaints/:id/internal-note
// @access  Private (Admin and Officer roles)
router.post('/:id/internal-note', isAuthenticated, authorizeRoles('admin', 'officer'), addInternalNote);

module.exports = router;
