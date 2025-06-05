import { Router } from 'express';
import { createProduct, deleteProduct, getProducts } from '../controllers/productController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateToken, getProducts);
router.post('/', authenticateToken, createProduct);
router.delete('/:productId', authenticateToken, deleteProduct);

export default router;
