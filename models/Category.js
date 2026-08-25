import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    icon: {
      type: String,
      default: 'BookOpen' // Default Lucide icon name for frontend UI
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
