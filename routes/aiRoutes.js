import express from 'express';
import { summarizeBook, recommendBooks } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/summarize', summarizeBook);
router.post('/recommend', protect, recommendBooks);

export default router;
