const Category = require('../models/Category');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create category (admin)
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        let image = '';
        if (req.file) {
            const fs = require('fs');
            const data = fs.readFileSync(req.file.path);
            const base64 = data.toString('base64');
            image = `data:${req.file.mimetype};base64,${base64}`;
        }

        const exists = await Category.findOne({ name });
        if (exists) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        const category = await Category.create({ name, description, image });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update category (admin)
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        category.name = name || category.name;
        category.description = description || category.description;

        if (req.file) {
            const fs = require('fs');
            const data = fs.readFileSync(req.file.path);
            const base64 = data.toString('base64');
            category.image = `data:${req.file.mimetype};base64,${base64}`;
        }

        const updated = await category.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete category (admin)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
