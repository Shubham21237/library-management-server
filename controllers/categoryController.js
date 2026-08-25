import Category from '../models/Category.js';

/**
 * @desc    Get all book categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Create a new category (Librarian/Admin only)
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'A category with this name already exists.'
      });
    }

    const category = await Category.create({ name, description, icon });
    res.status(201).json({
      status: 'success',
      data: category
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Delete a category (Librarian/Admin only)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Category not found.' });
    }
    res.status(200).json({ status: 'success', message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
