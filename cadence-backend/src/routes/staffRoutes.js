import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../controllers/staffController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;