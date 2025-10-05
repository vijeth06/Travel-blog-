const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const category = new Category({ name: req.body.name, description: req.body.description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });
    res.json({ msg: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
