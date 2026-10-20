import express from 'express';
import { requireAuth, requirePermission as allow } from '../middleware/authMiddleware.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/summary', allow('dashboard:view'), getDashboardSummary);

export default router;
