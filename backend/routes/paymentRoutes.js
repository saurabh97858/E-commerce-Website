const express = require('express');
const router = express.Router();
const { processPayment, getMyPayments, getAllPayments } = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/process', auth, processPayment);
router.get('/my-payments', auth, getMyPayments);
router.get('/all', auth, admin, getAllPayments);

module.exports = router;
