// Support Ticket Routes
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Public routes
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.get('/employee/:employeeId', ticketController.getTicketsByEmployee);

// Create ticket
router.post('/', ticketController.createTicket);

// Update ticket status (HR Admin only)
router.put('/:id', verifyToken, verifyRole(['HR_ADMIN', 'ADMIN']), ticketController.updateTicket);

module.exports = router;
