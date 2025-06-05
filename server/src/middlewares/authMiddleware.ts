import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminUser, generateAccessToken } from '../utils/authUtils';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ?? 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? 'your-refresh-token-secret';

declare global {
  namespace Express {
    interface Request {
      user?: AdminUser;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];
  const refreshToken = req.cookies?.refresh_token;

  if (!token) {
    res.status(403).json({ message: 'Token required.' });
    return;
  }

  if (!ACCESS_TOKEN_SECRET) {
    res.status(500).json({ message: 'Internal server error: JWT configuration missing.' });
    return;
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (!err) {
      req.user = user as AdminUser;
      return next();
    }

    if (err.name === 'TokenExpiredError' && refreshToken) {
      if (!REFRESH_TOKEN_SECRET) {
        return res
          .status(500)
          .json({ message: 'Internal server error: Refresh token secret missing.' });
      }

      jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
        (
          refreshErr: jwt.VerifyErrors | null,
          refreshUser: jwt.JwtPayload | string | AdminUser | undefined
        ) => {
          if (refreshErr) {
            // Clear the refresh token cookie
            res.clearCookie('refresh_token', {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
            });

            // Return appropriate error based on the type of error
            if (refreshErr.name === 'TokenExpiredError') {
              return res.status(403).json({
                message: 'Refresh token has expired. Please login again.',
                code: 'REFRESH_TOKEN_EXPIRED',
              });
            } else if (refreshErr.name === 'JsonWebTokenError') {
              return res.status(403).json({
                message: 'Invalid refresh token. Please login again.',
                code: 'INVALID_REFRESH_TOKEN',
              });
            }

            // For any other type of error
            return res.status(403).json({
              message: 'Authentication failed. Please login again.',
              code: 'AUTH_FAILED',
            });
          }

          const newAccessToken = generateAccessToken(refreshUser as AdminUser);
          res.setHeader('Authorization', `Bearer ${newAccessToken}`);

          req.user = refreshUser as AdminUser;
          next();
        }
      );
    } else {
      return res.status(403).json({ message: 'Invalid access token.' });
    }
  });
};
