import { Router } from 'express';
import { getExpensesByCategory } from '../controllers/expenseController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getExpensesByCategory);

export default router;
