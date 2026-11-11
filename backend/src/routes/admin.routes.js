import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import { getDashboardMetrics } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/metrics', protect, admin, getDashboardMetrics);

export default router;
