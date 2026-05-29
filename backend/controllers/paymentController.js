const Payment = require('../models/Payment');

// Process payment
exports.processPayment = async (req, res) => {
    try {
        const { orderId, paymentType, bankName, branch, cardNumber, amount } = req.body;
        const cardNumberLast4 = cardNumber.slice(-4);
        const payment = await Payment.create({
            order: orderId,
            user: req.user._id,
            paymentType,
            bankName,
            branch,
            cardNumberLast4,
            amount,
            status: 'Success'
        });
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user payments
exports.getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate('order')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all payments (admin)
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'name email')
            .populate('order')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
