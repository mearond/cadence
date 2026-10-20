import express from 'express';
import { requireAuth, requirePermission as allow, requireNumericParams } from '../middleware/authMiddleware.js';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../controllers/staffController.js';

const router = express.Router();
requireNumericParams(router, ['id']);

router.use(requireAuth);

router.get('/', allow('staff:view'), getStaff);
router.post('/', allow('staff:manage'), createStaff);
router.put('/:id', allow('staff:manage'), updateStaff);
router.delete('/:id', allow('staff:manage'), deleteStaff);

export default router;
