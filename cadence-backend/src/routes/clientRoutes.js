import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getMyEventAsClient, respondToApproval } from '../controllers/approvalController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/events/:eventId', getMyEventAsClient);
router.put('/events/:eventId/approvals/:id', respondToApproval);

export default router;