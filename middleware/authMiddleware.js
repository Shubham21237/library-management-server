import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @desc    Middleware to protect routes - Verifies JWT token from Authorization header
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token string: "Bearer <token_string>" -> "<token_string>"
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify token signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB using decoded token ID, excluding password field
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          status: 'fail',
          message: 'User belonging to this token no longer exists.'
        });
      }

      // Proceed to the next controller middleware
      next();
    } catch (error) {
      console.error('❌ Token Verification Error:', error.message);
      return res.status(401).json({
        status: 'fail',
        message: 'Not authorized, token failed or expired.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Not authorized, no bearer token provided.'
    });
  }
};

/**
 * @desc    Middleware to restrict access to Librarian/Admin role only
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      status: 'fail',
      message: 'Access denied: Librarian/Admin authorization required.'
    });
  }
};
