import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Exclude password field by default in queries for security
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    },
    // Gamification & Reading Analytics
    readingStreak: {
      currentStreak: { type: Number, default: 0 },
      lastReadMonth: { type: String, default: '' }
    },
    badges: [
      {
        name: { type: String },
        description: { type: String },
        awardedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * @desc Mongoose Pre-Save Hook: Automatically hashes password before saving user
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it has been modified or is new
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt (cost factor 10) and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * @desc Helper Instance Method: Compares entered plain-text password with hashed password
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
