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
import {
  getTimelineItems,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
} from '../controllers/timelineController.js';
import {
  getTasks, createTask, updateTask, deleteTask,
  addCheckpoint, toggleCheckpoint, deleteCheckpoint,
} from '../controllers/taskController.js';

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
router.get('/:eventId/timeline', getTimelineItems);
router.post('/:eventId/timeline', createTimelineItem);
router.put('/:eventId/timeline/:id', updateTimelineItem);
router.delete('/:eventId/timeline/:id', deleteTimelineItem);
router.get('/:eventId/tasks', getTasks);
router.post('/:eventId/tasks', createTask);
router.put('/:eventId/tasks/:id', updateTask);
router.delete('/:eventId/tasks/:id', deleteTask);

router.post('/:eventId/tasks/:taskId/checkpoints', addCheckpoint);
router.put('/:eventId/tasks/:taskId/checkpoints/:checkpointId/toggle', toggleCheckpoint);
router.delete('/:eventId/tasks/:taskId/checkpoints/:checkpointId', deleteCheckpoint);

export default router;