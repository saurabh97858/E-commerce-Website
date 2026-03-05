const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Dashboard stats
exports.getDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalCategories = await Category.countDocuments();
        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const pendingOrders = await Order.countDocuments({ status: 'Pending' });
        const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
        res.json({
            totalUsers, totalProducts, totalOrders, totalCategories,
            totalRevenue, pendingOrders, deliveredOrders
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Category-wise report
exports.getReports = async (req, res) => {
    try {
        const categories = await Category.find();
        const report = [];
        for (const cat of categories) {
            const products = await Product.find({ category: cat._id });
            const productIds = products.map(p => p._id);
            const orders = await Order.find({ 'items.product': { $in: productIds } });
            let totalSales = 0;
            let totalQuantity = 0;
            orders.forEach(order => {
                order.items.forEach(item => {
                    if (productIds.some(id => id.toString() === item.product.toString())) {
                        totalSales += item.price * item.quantity;
                        totalQuantity += item.quantity;
                    }
                });
            });
            report.push({
                category: cat.name,
                totalProducts: products.length,
                totalStock: products.reduce((sum, p) => sum + p.stock, 0),
                totalSales,
                totalQuantitySold: totalQuantity
            });
        }
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
