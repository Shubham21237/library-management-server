import Transaction from '../models/Transaction.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { calculateFine } from '../utils/fineCalculator.js';

/**
 * @desc    Submit a request to borrow a book or join waiting queue if out-of-stock
 * @route   POST /api/transactions/request
 * @access  Private (Member)
 */
export const requestBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    // 1. Verify book existence
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ status: 'fail', message: 'Book not found.' });
    }

    // 2. Check if user already has an active request/borrow for this book
    const existingTransaction = await Transaction.findOne({
      user: userId,
      book: bookId,
      status: { $in: ['PENDING', 'APPROVED', 'ISSUED', 'OVERDUE'] }
    });

    if (existingTransaction) {
      return res.status(400).json({
        status: 'fail',
        message: 'You already have an active request or issued copy for this book.'
      });
    }

    // 3. If out of stock, add user to Reservation Waiting Queue
    if (book.availableCopies <= 0) {
      const alreadyInQueue = book.reservationQueue.some(
        item => item.user.toString() === userId.toString()
      );

      if (alreadyInQueue) {
        return res.status(400).json({
          status: 'fail',
          message: 'You are already in the reservation waiting queue for this book.'
        });
      }

      book.reservationQueue.push({ user: userId, requestedAt: new Date() });
      await book.save();

      return res.status(200).json({
        status: 'success',
        isQueued: true,
        message: 'Book is currently out of stock. You have been added to the reservation waiting queue!'
      });
    }

    // 4. Create new PENDING borrow transaction
    const transaction = await Transaction.create({
      user: userId,
      book: bookId,
      status: 'PENDING'
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('book', 'title author coverImage isbn')
      .populate('user', 'name email');

    res.status(201).json({
      status: 'success',
      data: populatedTransaction
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Approve a borrow request & issue book (Librarian/Admin only)
 * @route   PUT /api/transactions/:id/approve
 * @access  Private/Admin
 */
export const approveIssueRequest = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ status: 'fail', message: 'Transaction not found.' });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot approve transaction with status '${transaction.status}'.`
      });
    }

    const book = await Book.findById(transaction.book);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot issue book: No available copies in stock.'
      });
    }

    // Set Issue & Due Dates (14 Days standard borrowing period)
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    transaction.status = 'ISSUED';
    transaction.issueDate = issueDate;
    transaction.dueDate = dueDate;
    await transaction.save();

    // Decrement available copies
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    await book.save();

    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('book', 'title author coverImage isbn')
      .populate('user', 'name email');

    res.status(200).json({
      status: 'success',
      data: updatedTransaction
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Reject a borrow request (Librarian/Admin only)
 * @route   PUT /api/transactions/:id/reject
 * @access  Private/Admin
 */
export const rejectRequest = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ status: 'fail', message: 'Transaction not found.' });
    }

    transaction.status = 'REJECTED';
    await transaction.save();

    res.status(200).json({
      status: 'success',
      message: 'Borrow request rejected successfully.'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Process returned book, calculate fine & auto-assign next waiting student
 * @route   PUT /api/transactions/:id/return
 * @access  Private/Admin
 */
export const returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ status: 'fail', message: 'Transaction not found.' });
    }

    if (transaction.status !== 'ISSUED' && transaction.status !== 'OVERDUE') {
      return res.status(400).json({
        status: 'fail',
        message: 'Transaction is not in an issued state.'
      });
    }

    const returnDate = new Date();
    const fineAmount = calculateFine(transaction.dueDate, returnDate);

    transaction.status = 'RETURNED';
    transaction.returnDate = returnDate;
    transaction.fineAmount = fineAmount;
    if (fineAmount === 0) {
      transaction.finePaid = true;
    }
    await transaction.save();

    // Increment book stock
    const book = await Book.findById(transaction.book);
    if (book) {
      book.availableCopies += 1;

      // Smart Feature #4: Auto-Queue Reservation Assignment
      if (book.reservationQueue && book.reservationQueue.length > 0) {
        const nextUserInQueue = book.reservationQueue.shift(); // Remove first waiting user

        // Create auto-reservation request for next student
        await Transaction.create({
          user: nextUserInQueue.user,
          book: book._id,
          status: 'PENDING',
          notes: 'Auto-reserved from waiting queue.'
        });
      }

      await book.save();
    }

    // Update Student Gamification Reading Streak
    const user = await User.findById(transaction.user);
    if (user) {
      const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
      if (user.readingStreak.lastReadMonth !== currentMonth) {
        user.readingStreak.currentStreak += 1;
        user.readingStreak.lastReadMonth = currentMonth;
        await user.save();
      }
    }

    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('book', 'title author coverImage isbn')
      .populate('user', 'name email');

    res.status(200).json({
      status: 'success',
      data: updatedTransaction
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Mark fine as paid
 * @route   PUT /api/transactions/:id/pay-fine
 * @access  Private
 */
export const payFine = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ status: 'fail', message: 'Transaction not found.' });
    }

    transaction.finePaid = true;
    await transaction.save();

    res.status(200).json({
      status: 'success',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Get logged in user's borrowing history & active transactions
 * @route   GET /api/transactions/my
 * @access  Private (Member)
 */
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate('book', 'title author coverImage isbn category shelfLocation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Get all transactions for Librarian Dashboard (with filters)
 * @route   GET /api/transactions
 * @access  Private/Admin
 */
export const getAllTransactions = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate('user', 'name email avatar')
      .populate('book', 'title author coverImage isbn shelfLocation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
