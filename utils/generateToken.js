import jwt from 'jsonwebtoken';

/**
 * @desc    Generates a signed JSON Web Token (JWT) for user authentication
 * @param   {string} id - User MongoDB ObjectId
 * @param   {string} role - User role ('admin' or 'member')
 * @returns {string} - Signed JWT string
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // Token remains valid for 30 days
  );
};

export default generateToken;
