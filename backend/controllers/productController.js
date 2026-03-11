const Product = require('../models/Product');

// Get all products (with search and filter)
exports.getProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }
        const products = await Product.find(query).populate('category', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create product (admin)
exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock, sizes } = req.body;
        // Convert uploaded files to base64 strings
        const images = req.files ? req.files.map(file => {
            const fs = require('fs');
            const data = fs.readFileSync(file.path);
            const base64 = data.toString('base64');
            return `data:${file.mimetype};base64,${base64}`;
        }) : [];

        // Parse sizes string back to array if sent as JSON from frontend FormData
        let parsedSizes = [];
        if (sizes) {
            try { parsedSizes = JSON.parse(sizes); }
            catch (e) { parsedSizes = sizes.split(',').map(s => s.trim()); }
        }

        const product = new Product({
            name,
            price,
            description,
            category,
            stock,
            sizes: parsedSizes,
            images
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update product (admin)
exports.updateProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock, sizes } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;
        if (sizes) {
            product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        }
        if (req.files && req.files.length > 0) {
            product.images = req.files.map(file => {
                const fs = require('fs');
                const data = fs.readFileSync(file.path);
                const base64 = data.toString('base64');
                return `data:${file.mimetype};base64,${base64}`;
            });
        }
        const updated = await product.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete product (admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
