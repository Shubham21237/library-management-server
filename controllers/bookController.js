import QRCode from 'qrcode';
import axios from 'axios';
import Book from '../models/Book.js';
import Category from '../models/Category.js';

/**
 * @desc    Get all books with optional search, filter & pagination
 * @route   GET /api/books
 * @access  Public
 */
export const getBooks = async (req, res) => {
  try {
    const { search, category, inStock, page = 1, limit = 12 } = req.query;

    const query = {};

    // 1. Text Search across Title, Author, and ISBN
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Category Filter
    if (category) {
      query.category = category;
    }

    // 3. Stock Availability Filter
    if (inStock === 'true') {
      query.availableCopies = { $gt: 0 };
    }

    // 4. Pagination math
    const skip = (Number(page) - 1) * Number(limit);

    const totalBooks = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('category', 'name icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      status: 'success',
      results: books.length,
      pagination: {
        totalBooks,
        currentPage: Number(page),
        totalPages: Math.ceil(totalBooks / Number(limit))
      },
      data: books
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Get single book details by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('category', 'name description icon')
      .populate('reservationQueue.user', 'name email avatar');

    if (!book) {
      return res.status(404).json({ status: 'fail', message: 'Book not found.' });
    }

    res.status(200).json({ status: 'success', data: book });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Create a new book (Librarian/Admin only)
 * @route   POST /api/books
 * @access  Private/Admin
 */
export const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      description,
      category,
      publisher,
      publishedDate,
      pageCount,
      totalCopies,
      shelfLocation,
      coverImageUrl
    } = req.body;

    // 1. Check if ISBN already exists
    const isbnExists = await Book.findOne({ isbn });
    if (isbnExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'A book with this ISBN number already exists in the catalog.'
      });
    }

    // 2. Generate QR Code Data URL for instant webcam scanning
    const qrCodeDataUrl = await QRCode.toDataURL(isbn);

    // 3. Handle Cover Image URL (Uploaded via Multer/Cloudinary or passed as URL string)
    let coverImage = {
      url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
      publicId: ''
    };

    if (req.file && req.file.path) {
      coverImage.url = req.file.path;
      coverImage.publicId = req.file.filename || '';
    } else if (coverImageUrl) {
      coverImage.url = coverImageUrl;
    }

    // 4. Create Book Document
    const book = await Book.create({
      title,
      author,
      isbn,
      description,
      category,
      publisher,
      publishedDate,
      pageCount: Number(pageCount) || 0,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
      shelfLocation,
      coverImage,
      qrCodeUrl: qrCodeDataUrl
    });

    const populatedBook = await Book.findById(book._id).populate('category', 'name icon');

    res.status(201).json({
      status: 'success',
      data: populatedBook
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Update book details & inventory (Librarian/Admin only)
 * @route   PUT /api/books/:id
 * @access  Private/Admin
 */
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ status: 'fail', message: 'Book not found.' });
    }

    const { totalCopies } = req.body;

    // Adjust available copies if totalCopies changes
    if (totalCopies !== undefined) {
      const copiesDifference = Number(totalCopies) - book.totalCopies;
      book.availableCopies = Math.max(0, book.availableCopies + copiesDifference);
      book.totalCopies = Number(totalCopies);
    }

    // Update other fields
    Object.assign(book, req.body);

    if (req.file && req.file.path) {
      book.coverImage = {
        url: req.file.path,
        publicId: req.file.filename || ''
      };
    }

    await book.save();
    const updatedBook = await Book.findById(book._id).populate('category', 'name icon');

    res.status(200).json({ status: 'success', data: updatedBook });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Delete a book (Librarian/Admin only)
 * @route   DELETE /api/books/:id
 * @access  Private/Admin
 */
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ status: 'fail', message: 'Book not found.' });
    }
    res.status(200).json({ status: 'success', message: 'Book deleted successfully.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Feature #1: Auto-Fetch Metadata from Google Books API by ISBN / Title
 * @route   GET /api/books/fetch-external
 * @access  Public / Admin
 */
export const fetchBookFromGoogle = async (req, res) => {
  try {
    const { isbn, query } = req.query;

    if (!isbn && !query) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an ISBN number or search query.'
      });
    }

    const searchQuery = isbn ? `isbn:${isbn}` : query;
    const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1`;

    const response = await axios.get(googleApiUrl);

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No matching book found on Google Books API.'
      });
    }

    const bookInfo = response.data.items[0].volumeInfo;

    // Standardize extracted book metadata
    const extractedData = {
      title: bookInfo.title || '',
      author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author',
      publisher: bookInfo.publisher || 'Unknown Publisher',
      publishedDate: bookInfo.publishedDate || '',
      description: bookInfo.description || '',
      pageCount: bookInfo.pageCount || 0,
      isbn: isbn || (bookInfo.industryIdentifiers ? bookInfo.industryIdentifiers[0]?.identifier : ''),
      coverImageUrl: bookInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || bookInfo.imageLinks?.smallThumbnail?.replace('http:', 'https:') || '',
      categories: bookInfo.categories || []
    };

    res.status(200).json({
      status: 'success',
      data: extractedData
    });
  } catch (error) {
    console.error('❌ Google Books API Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch book data from Google Books API.' });
  }
};
