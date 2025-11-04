import express from 'express';
import rateLimit from 'express-rate-limit';
import { loginUser, registerUser } from '../controllers/authController.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { msg: 'Muitas tentativas, tente novamente mais tarde.' }
});

router.post('/login', loginLimiter, loginUser);
router.post('/register', registerUser);

export default router;