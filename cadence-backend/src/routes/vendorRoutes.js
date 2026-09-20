import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getVendorCategories,
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from '../controllers/vendorController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/categories', getVendorCategories);
router.get('/', getVendors);
router.post('/', createVendor);
router.put('/:id', updateVendor);
router.delete('/:id', deleteVendor);

export default router;