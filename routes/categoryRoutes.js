import express from 'express';
import {
  getCategories,
  createCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, adminOnly, createCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
