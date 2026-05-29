const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
exports.register = async (req, res) => {
    try {
        const { name, surname, email, password, address, city, pincode, gender, mobile } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        const user = await User.create({ name, surname, email, password, address, city, pincode, gender, mobile });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle wishlist item
exports.toggleWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const isWishlisted = user.wishlist.includes(id);
        if (isWishlisted) {
            user.wishlist = user.wishlist.filter(item => item.toString() !== id);
        } else {
            user.wishlist.push(id);
        }
        
        await user.save();
        res.json({ wishlist: user.wishlist, isWishlisted: !isWishlisted });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get wishlist items
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            populate: { path: 'category', select: 'name' }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
