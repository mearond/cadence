import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { bookVendorForEvent, getEventVendors } from '../controllers/vendorController.js';
import {
  getBudgetItems,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  getBudgetSummary,
} from '../controllers/budgetController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/:eventId/vendors', getEventVendors);
router.post('/:eventId/vendors', bookVendorForEvent);
router.get('/:eventId/budget', getBudgetItems);
router.post('/:eventId/budget', createBudgetItem);
router.put('/:eventId/budget/:id', updateBudgetItem);
router.delete('/:eventId/budget/:id', deleteBudgetItem);
router.get('/:eventId/budget/summary', getBudgetSummary);

export default router;