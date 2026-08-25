import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  getUsers
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes
router.get('/profile', protect, getUserProfile);

// Admin Restricted Routes
router.get('/users', protect, adminOnly, getUsers);

export default router;
