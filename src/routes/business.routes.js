import express from 'express';

import {
  getBusinesses,
  getBusinessById,
  updateBusinessStatus,
} from '../controllers/business.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBusinesses);

router.get('/:id', getBusinessById);

router.patch('/:id/status', authenticate, authorize('Admin', 'BusinessManager'), updateBusinessStatus);

export default router;