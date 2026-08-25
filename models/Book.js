import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Please provide the author name'],
      trim: true
    },
    isbn: {
      type: String,
      required: [true, 'Please provide an ISBN number'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category']
    },
    publisher: {
      type: String,
      default: 'Unknown Publisher'
    },
    publishedDate: {
      type: String,
      default: ''
    },
    pageCount: {
      type: Number,
      default: 0
    },
    totalCopies: {
      type: Number,
      required: [true, 'Please specify total number of copies'],
      min: [1, 'Total copies must be at least 1']
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, 'Available copies cannot be negative']
    },
    shelfLocation: {
      type: String,
      default: 'General Shelf A1'
    },
    coverImage: {
      url: {
        type: String,
        default: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80'
      },
      publicId: {
        type: String,
        default: ''
      }
    },
    // Smart Waiting Queue for Out-of-Stock books
    reservationQueue: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        requestedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    qrCodeUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Book = mongoose.model('Book', bookSchema);
export default Book;
