import express from 'express';
import {
  requestBook,
  approveIssueRequest,
  rejectRequest,
  returnBook,
  payFine,
  getUserTransactions,
  getAllTransactions
} from '../controllers/transactionController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Member Routes
router.post('/request', protect, requestBook);
router.get('/my', protect, getUserTransactions);

// Fine Route
router.put('/:id/pay-fine', protect, payFine);

// Admin Routes
router.get('/', protect, adminOnly, getAllTransactions);
router.put('/:id/approve', protect, adminOnly, approveIssueRequest);
router.put('/:id/reject', protect, adminOnly, rejectRequest);
router.put('/:id/return', protect, adminOnly, returnBook);

export default router;
