import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Book from '../models/Book.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

const categoriesData = [
  {
    name: 'Computer Science & Coding',
    description: 'Software engineering, algorithms, clean architecture, and web development.',
    icon: 'Code'
  },
  {
    name: 'Science Fiction & Fantasy',
    description: 'Imaginative universes, space exploration, and futuristic speculative fiction.',
    icon: 'Sparkles'
  },
  {
    name: 'Self-Help & Productivity',
    description: 'Habit formation, deep focus, time management, and personal development.',
    icon: 'Compass'
  },
  {
    name: 'Business & Finance',
    description: 'Personal finance, investing psychology, leadership, and startup economics.',
    icon: 'TrendingUp'
  },
  {
    name: 'Psychology & Philosophy',
    description: 'Human behavior, cognitive thinking, mental resilience, and classical ethics.',
    icon: 'Brain'
  }
];

const usersData = [
  {
    name: 'Shubham Yadav (Librarian)',
    email: 'yadavs79565@gmail.com',
    password: 'password123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    readingStreak: { currentStreak: 12, lastReadMonth: 'October 2026' }
  },
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    password: 'password123',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    readingStreak: { currentStreak: 4, lastReadMonth: 'October 2026' },
    badges: [
      { name: 'Bookworm', description: 'Read 5 books in one semester' },
      { name: 'Early Bird', description: 'Returned all books before due dates' }
    ]
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    password: 'password123',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    readingStreak: { currentStreak: 6, lastReadMonth: 'October 2026' },
    badges: [
      { name: 'Streak Master', description: 'Maintained 6-month reading streak' },
      { name: 'Critic Choice', description: 'Wrote top-rated community reviews' }
    ]
  }
];

const booksRawData = [
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    publisher: 'Prentice Hall',
    publishedDate: '2008-08-01',
    pageCount: 464,
    totalCopies: 5,
    availableCopies: 4,
    shelfLocation: 'Shelf CS-101',
    categoryName: 'Computer Science & Coding',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Even bad code can function. But if code is not clean, it can bring a development organization to its knees. Clean Code is divided into three parts: principles of writing clean code, several case studies of increasing complexity, and the payoff: a collection of heuristics gathered while creating the case studies.',
    reviews: [
      {
        userName: 'Aarav Sharma',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'Essential reading for every software engineer. The chapter on meaningful names completely changed how I write code!'
      },
      {
        userName: 'Priya Patel',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        rating: 4,
        comment: 'Great principles and timeless guidelines for refactoring and unit testing.'
      }
    ]
  },
  {
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    author: 'David Thomas, Andrew Hunt',
    isbn: '9780135957059',
    publisher: 'Addison-Wesley Professional',
    publishedDate: '2019-09-13',
    pageCount: 352,
    totalCopies: 4,
    availableCopies: 3,
    shelfLocation: 'Shelf CS-102',
    categoryName: 'Computer Science & Coding',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process: taking a requirement and producing working, maintainable code that delights its users.',
    reviews: [
      {
        userName: 'Aarav Sharma',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'Full of practical tips from debugging mindset to DRY code. Highly recommended!'
      }
    ]
  },
  {
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    author: 'James Clear',
    isbn: '9780735211292',
    publisher: 'Avery',
    publishedDate: '2018-10-16',
    pageCount: 320,
    totalCopies: 6,
    availableCopies: 5,
    shelfLocation: 'Shelf SH-201',
    categoryName: 'Self-Help & Productivity',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear, one of the world leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    reviews: [
      {
        userName: 'Priya Patel',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: '1% better every day! The 4 laws of behavior change make implementing new routines effortless.'
      }
    ]
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    isbn: '9780593135204',
    publisher: 'Ballantine Books',
    publishedDate: '2021-05-04',
    pageCount: 496,
    totalCopies: 4,
    availableCopies: 3,
    shelfLocation: 'Shelf SF-301',
    categoryName: 'Science Fiction & Fantasy',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission and if he fails, humanity and the earth itself will perish. Except that right now, he does not know that. He can not even remember his own name, let alone the nature of his assignment or how to complete it.',
    reviews: [
      {
        userName: 'Aarav Sharma',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'Fabulous sci-fi! If you loved The Martian, you will love Rocky and Grace.'
      }
    ]
  },
  {
    title: 'Deep Work: Rules for Focused Success in a Distracted World',
    author: 'Cal Newport',
    isbn: '9781455586691',
    publisher: 'Grand Central Publishing',
    publishedDate: '2016-01-05',
    pageCount: 304,
    totalCopies: 3,
    availableCopies: 0, // In demand / Out of stock to demonstrate reservation waiting queue!
    shelfLocation: 'Shelf SH-202',
    categoryName: 'Self-Help & Productivity',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Deep work is the ability to focus without distraction on a cognitively demanding task. It is a skill that allows you to quickly master complicated information and produce better results in less time.',
    reviews: [
      {
        userName: 'Priya Patel',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'A transformative read in this era of constant notifications. Must-read for students!'
      }
    ]
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '9780441172719',
    publisher: 'Ace Books',
    publishedDate: '1965-08-01',
    pageCount: 688,
    totalCopies: 5,
    availableCopies: 4,
    shelfLocation: 'Shelf SF-302',
    categoryName: 'Science Fiction & Fantasy',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the spice melange.',
    reviews: [
      {
        userName: 'Aarav Sharma',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'The world-building and political intrigue are unmatched in modern fiction.'
      }
    ]
  },
  {
    title: 'The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness',
    author: 'Morgan Housel',
    isbn: '9780857197689',
    publisher: 'Harriman House',
    publishedDate: '2020-09-08',
    pageCount: 256,
    totalCopies: 5,
    availableCopies: 4,
    shelfLocation: 'Shelf BZ-401',
    categoryName: 'Business & Finance',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Doing well with money is not necessarily about what you know. It is about how you behave. And behavior is hard to teach, even to really smart people. Morgan Housel shares 19 short stories exploring the strange ways people think about money.',
    reviews: [
      {
        userName: 'Priya Patel',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        comment: 'Concise, clear, and immensely wisdom-packed. Changed my relationship with savings.'
      }
    ]
  },
  {
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '9780201633610',
    publisher: 'Addison-Wesley',
    publishedDate: '1994-10-31',
    pageCount: 395,
    totalCopies: 3,
    availableCopies: 2,
    shelfLocation: 'Shelf CS-103',
    categoryName: 'Computer Science & Coding',
    coverImage: 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    description: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.',
    reviews: [
      {
        userName: 'Aarav Sharma',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
        rating: 4,
        comment: 'The Gang of Four bible. Classic reference for software architecture patterns.'
      }
    ]
  }
];

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI is not set in environment variables.');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Clean existing records if requested with -d flag
    if (process.argv.includes('-d')) {
      console.log('🗑️ Clearing existing database records...');
      await Transaction.deleteMany({});
      await Book.deleteMany({});
      await Category.deleteMany({});
      await User.deleteMany({});
      console.log('✅ Existing records cleared.');
    }

    // 1. Seed or Upsert Categories
    console.log('📦 Seeding Categories...');
    const categoryMap = {};
    for (const cat of categoriesData) {
      let existingCat = await Category.findOne({ name: cat.name });
      if (!existingCat) {
        existingCat = await Category.create(cat);
      }
      categoryMap[cat.name] = existingCat._id;
    }
    console.log(`✅ ${Object.keys(categoryMap).length} Categories ready.`);

    // 2. Seed or Upsert Users
    console.log('👥 Seeding Users...');
    const userMap = {};
    for (const u of usersData) {
      let existingUser = await User.findOne({ email: u.email });
      if (!existingUser) {
        existingUser = await User.create(u);
      }
      userMap[u.email] = existingUser;
    }
    console.log(`✅ ${Object.keys(userMap).length} Users ready.`);

    const studentAarav = userMap['aarav.sharma@example.com'];
    const studentPriya = userMap['priya.patel@example.com'];

    // 3. Seed or Upsert Books with generated QR codes and reviews
    console.log('📚 Seeding Books with QR Codes & Ratings...');
    const bookMap = {};
    for (const b of booksRawData) {
      let existingBook = await Book.findOne({ isbn: b.isbn });
      const qrDataUrl = await QRCode.toDataURL(b.isbn);

      const reviewObjects = b.reviews.map(r => ({
        user: r.userName.includes('Aarav') ? studentAarav._id : studentPriya._id,
        userName: r.userName,
        userAvatar: r.userAvatar,
        rating: r.rating,
        comment: r.comment,
        createdAt: new Date()
      }));

      const avgRating = reviewObjects.length > 0
        ? reviewObjects.reduce((acc, cur) => acc + cur.rating, 0) / reviewObjects.length
        : 0;

      const bookPayload = {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        publisher: b.publisher,
        publishedDate: b.publishedDate,
        pageCount: b.pageCount,
        totalCopies: b.totalCopies,
        availableCopies: b.availableCopies,
        shelfLocation: b.shelfLocation,
        category: categoryMap[b.categoryName],
        description: b.description,
        coverImage: { url: b.coverImage, publicId: '' },
        pdfUrl: b.pdfUrl,
        qrCodeUrl: qrDataUrl,
        reviews: reviewObjects,
        averageRating: avgRating,
        numReviews: reviewObjects.length,
        reservationQueue: b.availableCopies === 0 ? [{ user: studentAarav._id, requestedAt: new Date() }] : []
      };

      if (!existingBook) {
        existingBook = await Book.create(bookPayload);
      } else {
        Object.assign(existingBook, bookPayload);
        await existingBook.save();
      }
      bookMap[b.isbn] = existingBook;
    }
    console.log(`✅ ${Object.keys(bookMap).length} Books ready.`);

    // 4. Seed Realistic Transactions (Issued, Pending, Overdue, Returned)
    console.log('💳 Seeding Transactions...');
    await Transaction.deleteMany({}); // Refresh transactions to prevent duplicates

    const cleanCode = bookMap['9780132350884'];
    const atomicHabits = bookMap['9780735211292'];
    const dune = bookMap['9780441172719'];
    const psychOfMoney = bookMap['9780857197689'];

    const today = new Date();
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    const eighteenDaysAgo = new Date(Date.now() - 18 * 24 * 60 * 60 * 1000);
    const fourDaysFromNow = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    const sampleTransactions = [
      {
        user: studentAarav._id,
        book: cleanCode._id,
        issueDate: tenDaysAgo,
        dueDate: fourDaysFromNow,
        status: 'ISSUED',
        notes: 'Borrow approved by Librarian.'
      },
      {
        user: studentPriya._id,
        book: atomicHabits._id,
        status: 'PENDING',
        notes: 'Waiting for Librarian approval at counter.'
      },
      {
        user: studentPriya._id,
        book: dune._id,
        issueDate: eighteenDaysAgo,
        dueDate: fourDaysAgo,
        status: 'OVERDUE',
        fineAmount: 20, // 4 days * 5 Rs
        finePaid: false,
        notes: 'Automated Overdue fine applied: ₹5/day.'
      },
      {
        user: studentAarav._id,
        book: psychOfMoney._id,
        issueDate: eighteenDaysAgo,
        dueDate: fourDaysAgo,
        returnDate: today,
        status: 'RETURNED',
        fineAmount: 0,
        finePaid: true,
        notes: 'Returned on time in pristine condition.'
      }
    ];

    await Transaction.insertMany(sampleTransactions);
    console.log(`✅ ${sampleTransactions.length} Sample Transactions created.`);

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Librarian Login: yadavs79565@gmail.com / password123');
    console.log('Member 1 Login:  aarav.sharma@example.com / password123');
    console.log('Member 2 Login:  priya.patel@example.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedDatabase();
