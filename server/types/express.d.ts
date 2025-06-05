import { AdminUsers } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: AdminUsers;
    }
  }
}
