import express from 'express';
import { signup, login, setPassword } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/set-password', requireAuth, setPassword);

export default router;