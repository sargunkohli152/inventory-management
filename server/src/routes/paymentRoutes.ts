import express, { Request, Response, NextFunction } from 'express';
import { handleWebhook } from '../controllers/paymentController';

const router = express.Router();

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req: Request, res: Response, next: NextFunction) => {
    handleWebhook(req, res).catch(next);
  }
);

export default router;
