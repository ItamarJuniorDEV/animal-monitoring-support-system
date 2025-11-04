import express from 'express';
import { listFarms } from '../controllers/farmController.js';

const router = express.Router();

router.get('/', listFarms);

export default router;