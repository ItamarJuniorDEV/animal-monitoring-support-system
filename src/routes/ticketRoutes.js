import express from 'express';
import { listTickets, createTicket, updateTicketStatus, deleteTicket, getTicketHistory, testClassification, getTicketById } from '../controllers/ticketController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', verifyToken, listTickets);                  
router.post('/', verifyToken, createTicket);
router.post('/classify', testClassification);
router.get('/:id/history', verifyToken, getTicketHistory);
router.get('/:id', verifyToken, getTicketById);              
router.put('/:id', verifyToken, updateTicketStatus);          
router.delete('/:id', verifyToken, deleteTicket);

export default router;