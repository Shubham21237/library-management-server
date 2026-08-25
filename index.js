import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { initCronJobs } from './utils/cronJobs.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// 1. Load Environment Variables from .env file into process.env
dotenv.config();

// 2. Initialize MongoDB Connection
connectDB();

// 3. Initialize Background Scheduled Cron Jobs
initCronJobs();

// 4. Initialize Express Application
const app = express();

// 5. Global Middleware Setup
// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming requests with JSON payloads (req.body)
app.use(express.json());

// Parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// 6. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '📚 Library Management System API is running smoothly!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 6. Global Error Middleware Handlers
app.use(notFound);
app.use(errorHandler);

// 7. Start Listening on Configured Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🔗 Health Check URL: http://localhost:${PORT}/api/health`);
});
