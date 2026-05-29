const Product = require('../models/Product');

// Get all products (with search, filter and pagination)
exports.getProducts = async (req, res) => {
    try {
        const { search, category, page = 1, limit = 20, minPrice, maxPrice, size } = req.query;
        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (size) {
            query.sizes = size;
        }
        
        const skip = (page - 1) * limit;
        // Images are now file paths (not base64), safe to include
        const products = await Product.find(query)
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();
            
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
        
        // Use relative file paths instead of base64
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

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
        
        // Update images with relative paths if new ones are uploaded
        if (req.files && req.files.length > 0) {
            product.images = req.files.map(file => `/uploads/${file.filename}`);
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

// Submit/Update product review
exports.submitProductReview = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        const alreadyReviewed = product.ratings.find(
            (r) => r.userId.toString() === req.user._id.toString()
        );
        
        if (alreadyReviewed) {
            alreadyReviewed.rating = Number(rating);
            alreadyReviewed.review = review;
        } else {
            product.ratings.push({
                userId: req.user._id,
                userName: `${req.user.name} ${req.user.surname}`,
                rating: Number(rating),
                review
            });
        }
        
        product.numReviews = product.ratings.length;
        product.rating = product.ratings.reduce((acc, item) => item.rating + acc, 0) / product.ratings.length;
        
        await product.save();
        res.status(201).json({ message: 'Review added/updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
