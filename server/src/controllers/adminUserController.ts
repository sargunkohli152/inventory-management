import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
} from '../utils/authUtils';

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { adminUserId, name, email, password } = req.body;

    if (!adminUserId || !name || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const existingUser = await prisma.adminUsers.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const hashedPassword = hashPassword(password);

    const newUser = await prisma.adminUsers.create({
      data: {
        adminUserId,
        name,
        email,
        password: hashedPassword,
      },
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Set refresh token as HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'User created successfully!',
      tokens: { accessToken },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error signing up user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Both email and password are required' });
      return;
    }

    const user = await prisma.adminUsers.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: 'User does not exist. Please sign up first.' });
      return;
    }

    const isPasswordValid = comparePasswords(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful!',
      tokens: { accessToken },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in user', error: error });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear the refresh token cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out' });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await prisma.adminUsers.findUnique({
      where: { adminUserId: (req.user as any).userId },
      select: {
        adminUserId: true,
        name: true,
        email: true,
        hasAccess: true,
        priceId: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user information' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ message: 'Valid name is required' });
      return;
    }

    const updatedUser = await prisma.adminUsers.update({
      where: { adminUserId: (req.user as any).userId },
      data: { name: name.trim() },
      select: {
        adminUserId: true,
        name: true,
        email: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user information' });
  }
};
