import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  fetchBookFromGoogle,
  addBookReview
} from '../controllers/bookController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public / Search Routes
router.get('/', getBooks);
router.get('/fetch-external', fetchBookFromGoogle); // Google Books API Auto-Fill
router.get('/:id', getBookById);

// Protected Community Review Route
router.post('/:id/reviews', protect, addBookReview);

// Admin Restricted Routes (with optional file upload)
router.post('/', protect, adminOnly, upload.single('coverImage'), createBook);
router.put('/:id', protect, adminOnly, upload.single('coverImage'), updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

export default router;
