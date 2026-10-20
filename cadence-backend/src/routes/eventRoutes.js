import express from 'express';
import { requireAuth, requirePermission as allow, requireNumericParams } from '../middleware/authMiddleware.js';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { bookVendorForEvent, getEventVendors, updateEventVendor } from '../controllers/vendorController.js';
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
import { getApprovals, createApprovalRequest, deleteApprovalRequest } from '../controllers/approvalController.js';
import { inviteClientToEvent } from '../controllers/clientInviteController.js';
import { getEventClients, removeEventClient } from '../controllers/eventClientController.js';
import { getEventRating } from '../controllers/ratingController.js';

const router = express.Router();
requireNumericParams(router, ['id', 'eventId', 'taskId', 'checkpointId', 'clientId']);

router.use(requireAuth);

router.get('/', allow('events:view'), getEvents);
router.get('/:id', allow('events:view'), getEventById);
router.post('/', allow('events:create'), createEvent);
router.put('/:id', allow('events:edit'), updateEvent);
router.delete('/:id', allow('events:delete'), deleteEvent);

router.get('/:eventId/vendors', allow('vendors:view'), getEventVendors);
router.post('/:eventId/vendors', allow('vendors:manage'), bookVendorForEvent);
router.put('/:eventId/vendors/:id', allow('vendors:manage'), updateEventVendor);

router.get('/:eventId/budget', allow('budget:view'), getBudgetItems);
router.post('/:eventId/budget', allow('budget:manage'), createBudgetItem);
router.put('/:eventId/budget/:id', allow('budget:manage'), updateBudgetItem);
router.delete('/:eventId/budget/:id', allow('budget:manage'), deleteBudgetItem);
router.get('/:eventId/budget/summary', allow('budget:view'), getBudgetSummary);

router.get('/:eventId/timeline', allow('timeline:view'), getTimelineItems);
router.post('/:eventId/timeline', allow('timeline:manage'), createTimelineItem);
router.put('/:eventId/timeline/:id', allow('timeline:manage'), updateTimelineItem);
router.delete('/:eventId/timeline/:id', allow('timeline:manage'), deleteTimelineItem);

router.get('/:eventId/tasks', allow('tasks:view'), getTasks);
router.post('/:eventId/tasks', allow('tasks:manage'), createTask);
// Everyone can update a task; the controller limits event staff to the status field.
router.put('/:eventId/tasks/:id', allow('tasks:updateStatus'), updateTask);
router.delete('/:eventId/tasks/:id', allow('tasks:delete'), deleteTask);

router.post('/:eventId/tasks/:taskId/checkpoints', allow('tasks:manage'), addCheckpoint);
router.put('/:eventId/tasks/:taskId/checkpoints/:checkpointId/toggle', allow('tasks:updateStatus'), toggleCheckpoint);
router.delete('/:eventId/tasks/:taskId/checkpoints/:checkpointId', allow('tasks:manage'), deleteCheckpoint);

router.get('/:eventId/approvals', allow('approvals:view'), getApprovals);
router.post('/:eventId/approvals', allow('approvals:manage'), createApprovalRequest);
router.delete('/:eventId/approvals/:id', allow('approvals:manage'), deleteApprovalRequest);

router.post('/:eventId/invite-client', allow('clients:manage'), inviteClientToEvent);
router.get('/:eventId/clients', allow('clients:view'), getEventClients);
router.delete('/:eventId/clients/:clientId', allow('clients:manage'), removeEventClient);

router.get('/:eventId/rating', allow('events:view'), getEventRating);

export default router;
