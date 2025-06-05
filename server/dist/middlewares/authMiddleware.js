"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authUtils_1 = require("../utils/authUtils");
const ACCESS_TOKEN_SECRET = (_a = process.env.ACCESS_TOKEN_SECRET) !== null && _a !== void 0 ? _a : 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = (_b = process.env.REFRESH_TOKEN_SECRET) !== null && _b !== void 0 ? _b : 'your-refresh-token-secret';
const authenticateToken = (req, res, next) => {
    var _a, _b;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const refreshToken = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refresh_token;
    if (!token) {
        res.status(403).json({ message: 'Token required.' });
        return;
    }
    if (!ACCESS_TOKEN_SECRET) {
        res.status(500).json({ message: 'Internal server error: JWT configuration missing.' });
        return;
    }
    jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        if (!err) {
            req.user = user;
            return next();
        }
        if (err.name === 'TokenExpiredError' && refreshToken) {
            if (!REFRESH_TOKEN_SECRET) {
                return res
                    .status(500)
                    .json({ message: 'Internal server error: Refresh token secret missing.' });
            }
            jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET, (refreshErr, refreshUser) => {
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
                    }
                    else if (refreshErr.name === 'JsonWebTokenError') {
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
                const newAccessToken = (0, authUtils_1.generateAccessToken)(refreshUser);
                res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                req.user = refreshUser;
                next();
            });
        }
        else {
            return res.status(403).json({ message: 'Invalid access token.' });
        }
    });
};
exports.authenticateToken = authenticateToken;
