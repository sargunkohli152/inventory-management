"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = exports.hashPassword = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error('JWT secrets must be configured');
}
const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION = '7d';
// Function to generate access token
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign({ userId: user.adminUserId }, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
};
exports.generateAccessToken = generateAccessToken;
// Function to generate refresh token
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign({ userId: user.adminUserId }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRATION,
    });
};
exports.generateRefreshToken = generateRefreshToken;
// Function to hash passwords
const hashPassword = (password) => {
    return bcryptjs_1.default.hashSync(password, 10);
};
exports.hashPassword = hashPassword;
// Function to compare passwords
const comparePasswords = (password, hashedPassword) => {
    return bcryptjs_1.default.compareSync(password, hashedPassword);
};
exports.comparePasswords = comparePasswords;
