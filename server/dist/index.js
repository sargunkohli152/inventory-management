"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// ROUTE IMPORTS
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const adminUserRoutes_1 = __importDefault(require("./routes/adminUserRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
// CONFIGURATIONS
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cookie_parser_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://inventory-management-frontend-m0y6.onrender.com'],
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use((0, morgan_1.default)('dev'));
// Routes that need raw body (must come before body parsing middleware)
app.use('/api/payments', paymentRoutes_1.default);
// Body parsing middleware (must come after routes that need raw body)
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/dashboard', dashboardRoutes_1.default);
app.use('/products', productRoutes_1.default);
app.use('/users', userRoutes_1.default);
app.use('/expenses', expenseRoutes_1.default);
app.use('/admin', adminUserRoutes_1.default);
// SERVER
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : '3001';
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});
