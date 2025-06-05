import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// ROUTE IMPORTS
import dashboardRoutes from './routes/dashboardRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import expenseRoutes from './routes/expenseRoutes';
import signupRoutes from './routes/adminUserRoutes';
import paymentRoutes from './routes/paymentRoutes';

// CONFIGURATIONS
dotenv.config();
const app = express();

// Middleware
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://inventory-management-frontend-m0y6.onrender.com/'],
    credentials: true,
  })
);

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('dev'));

// Routes that need raw body (must come before body parsing middleware)
app.use('/api/payments', paymentRoutes);

// Body parsing middleware (must come after routes that need raw body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/dashboard', dashboardRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);
app.use('/admin', signupRoutes);

// SERVER
const port = process.env.PORT ?? '3001';
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
