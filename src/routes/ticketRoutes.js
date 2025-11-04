import express from 'express';
import { listTickets, createTicket, updateTicketStatus, deleteTicket, getTicketHistory, testClassification } from '../controllers/ticketController.js';

const router = express.Router();

router.get('/', listTickets);
router.post('/', createTicket);
router.get('/:id/history', getTicketHistory); 
router.put('/:id', updateTicketStatus);
router.delete('/:id', deleteTicket);
router.post('/classify', testClassification);

export default router;