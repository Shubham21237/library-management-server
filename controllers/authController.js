import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @desc    Register a new user (Student or Admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'A user with this email address already exists.'
      });
    }

    // 2. Create new user instance (pre-save hook in User.js hashes the password automatically)
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'member'
    });

    if (user) {
      // 3. Return user details and JWT auth token
      res.status(201).json({
        status: 'success',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          readingStreak: user.readingStreak,
          badges: user.badges,
          token: generateToken(user._id, user.role)
        }
      });
    } else {
      res.status(400).json({ status: 'fail', message: 'Invalid user data provided.' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Authenticate user & get JWT token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email and explicitly select password field
    const user = await User.findOne({ email }).select('+password');

    // 2. Verify password match using bcrypt instance method
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        status: 'success',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          readingStreak: user.readingStreak,
          badges: user.badges,
          token: generateToken(user._id, user.role)
        }
      });
    } else {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid email address or password.'
      });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Get logged in user profile
 * @route   GET /api/auth/profile
 * @access  Private (Protected by JWT)
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        status: 'success',
        data: user
      });
    } else {
      res.status(404).json({ status: 'fail', message: 'User profile not found.' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Get all users list (Librarian/Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
