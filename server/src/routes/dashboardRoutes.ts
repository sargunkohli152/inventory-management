import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getDashboardMetrics);

export default router;
