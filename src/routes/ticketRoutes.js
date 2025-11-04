import express from 'express';
import { listTickets, createTicket, updateTicketStatus, deleteTicket, getTicketHistory, testClassification } from '../controllers/ticketController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', verifyToken, listTickets);                  
router.post('/', verifyToken, createTicket);                  
router.get('/:id/history', verifyToken, getTicketHistory);   
router.put('/:id', verifyToken, updateTicketStatus);          
router.delete('/:id', verifyToken, deleteTicket);  

router.post('/classify', testClassification);

export default router;