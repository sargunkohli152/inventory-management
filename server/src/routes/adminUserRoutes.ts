import { Router } from 'express';
import {
  login,
  signup,
  logout,
  getCurrentUser,
  updateUser,
} from '../controllers/adminUserController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getCurrentUser);
router.patch('/update', authenticateToken, updateUser);

export default router;
