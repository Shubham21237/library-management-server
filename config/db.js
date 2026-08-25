import mongoose from 'mongoose';

/**
 * @desc    Connects Node.js application to MongoDB via Mongoose ODM
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code (1) if database connection fails
    process.exit(1);
  }
};

export default connectDB;
