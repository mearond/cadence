import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getMyEventAsClient, getMyEvents, respondToApproval } from '../controllers/approvalController.js';
import { getMyEventRating, submitEventRating } from '../controllers/ratingController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/events', getMyEvents);
router.get('/events/:eventId', getMyEventAsClient);
router.put('/events/:eventId/approvals/:id', respondToApproval);
router.get('/events/:eventId/rating', getMyEventRating);
router.post('/events/:eventId/rating', submitEventRating);

export default router;