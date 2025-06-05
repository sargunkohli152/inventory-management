"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getCurrentUser = exports.logout = exports.login = exports.signup = void 0;
const client_1 = require("@prisma/client");
const authUtils_1 = require("../utils/authUtils");
const prisma = new client_1.PrismaClient();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminUserId, name, email, password } = req.body;
        if (!adminUserId || !name || !email || !password) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        const existingUser = yield prisma.adminUsers.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(409).json({ message: 'Email already in use' });
            return;
        }
        const hashedPassword = (0, authUtils_1.hashPassword)(password);
        const newUser = yield prisma.adminUsers.create({
            data: {
                adminUserId,
                name,
                email,
                password: hashedPassword,
            },
        });
        const accessToken = (0, authUtils_1.generateAccessToken)(newUser);
        const refreshToken = (0, authUtils_1.generateRefreshToken)(newUser);
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error signing up user' });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Both email and password are required' });
            return;
        }
        const user = yield prisma.adminUsers.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(401).json({ message: 'User does not exist. Please sign up first.' });
            return;
        }
        const isPasswordValid = (0, authUtils_1.comparePasswords)(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const accessToken = (0, authUtils_1.generateAccessToken)(user);
        const refreshToken = (0, authUtils_1.generateRefreshToken)(user);
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in user' });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Clear the refresh token cookie
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging out' });
    }
});
exports.logout = logout;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const user = yield prisma.adminUsers.findUnique({
            where: { adminUserId: req.user.userId },
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
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user information' });
    }
});
exports.getCurrentUser = getCurrentUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const updatedUser = yield prisma.adminUsers.update({
            where: { adminUserId: req.user.userId },
            data: { name: name.trim() },
            select: {
                adminUserId: true,
                name: true,
                email: true,
            },
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user information' });
    }
});
exports.updateUser = updateUser;
