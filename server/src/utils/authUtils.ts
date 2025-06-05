import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT secrets must be configured');
}

const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';

export interface AdminUser {
  adminUserId: string;
  name: string;
  email: string;
  password: string;
}

// Function to generate access token
export const generateAccessToken = (user: AdminUser) => {
  return jwt.sign({ userId: user.adminUserId }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
};

// Function to generate refresh token
export const generateRefreshToken = (user: AdminUser) => {
  return jwt.sign({ userId: user.adminUserId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });
};

// Function to hash passwords
export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

// Function to compare passwords
export const comparePasswords = (password: string, hashedPassword: string) => {
  return bcrypt.compareSync(password, hashedPassword);
};
