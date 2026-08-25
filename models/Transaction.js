import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    issueDate: {
      type: Date,
      default: null
    },
    dueDate: {
      type: Date,
      default: null
    },
    returnDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'ISSUED', 'REJECTED', 'RETURNED', 'OVERDUE'],
      default: 'PENDING'
    },
    fineAmount: {
      type: Number,
      default: 0
    },
    finePaid: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
