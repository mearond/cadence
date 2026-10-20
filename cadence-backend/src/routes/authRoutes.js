import express from 'express';
import { signup, login, setPassword, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/set-password', requireAuth, setPassword);
router.get('/me', requireAuth, getMe);

export default router;