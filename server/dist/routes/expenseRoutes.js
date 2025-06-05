"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expenseController_1 = require("../controllers/expenseController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authenticateToken, expenseController_1.getExpensesByCategory);
exports.default = router;
