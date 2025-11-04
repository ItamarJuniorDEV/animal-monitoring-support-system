import express from 'express';
import { listFarms } from '../controllers/farmController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';  

const router = express.Router();

router.get('/', verifyToken, listFarms);  

export default router;