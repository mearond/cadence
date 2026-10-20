import express from 'express';
import { requireAuth, requirePermission as allow } from '../middleware/authMiddleware.js';
import {
  getVendorCategories,
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from '../controllers/vendorController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/categories', allow('vendors:view'), getVendorCategories);
router.get('/', allow('vendors:view'), getVendors);
router.post('/', allow('vendors:manage'), createVendor);
router.put('/:id', allow('vendors:manage'), updateVendor);
router.delete('/:id', allow('vendors:manage'), deleteVendor);

export default router;
