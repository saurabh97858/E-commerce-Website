const Cart = require('../models/Cart');

// Get cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, size } = req.body;
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        const existingItem = cart.items.find(
            item => item.product.toString() === productId && item.size === (size || '')
        );
        if (existingItem) {
            existingItem.quantity += quantity || 1;
        } else {
            cart.items.push({ product: productId, quantity: quantity || 1, size: size || '' });
        }
        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update cart item
exports.updateCart = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        item.quantity = quantity;
        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
        await cart.save();
        const populatedCart = await Cart.findById(cart._id).populate('items.product');
        res.json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
