// Support Ticket Controller
const ticketModel = require('../models/ticket');

const getTickets = async (req, res, next) => {
  try {
    const status = req.query.status;
    let tickets;
    
    if (status) {
      tickets = await ticketModel.getTicketsByStatus(status);
    } else {
      tickets = await ticketModel.getAllTickets();
    }
    
    res.json({
      success: true,
      data: tickets,
      count: tickets.length
    });
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketModel.getTicketById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

const getTicketsByEmployee = async (req, res, next) => {
  try {
    const tickets = await ticketModel.getTicketsByEmployee(req.params.employeeId);
    res.json({
      success: true,
      data: tickets,
      count: tickets.length
    });
  } catch (error) {
    next(error);
  }
};

const createTicket = async (req, res, next) => {
  try {
    const { employee_id, subject, description } = req.body;
    
    if (!employee_id || !subject) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const ticket = await ticketModel.createTicket(req.body);
    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Support ticket created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const ticket = await ticketModel.updateTicket(req.params.id, { status });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({
      success: true,
      data: ticket,
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  getTicketById,
  getTicketsByEmployee,
  createTicket,
  updateTicket
};
