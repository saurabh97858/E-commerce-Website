const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/place', auth, placeOrder);
router.get('/my-orders', auth, getMyOrders);
router.get('/all', auth, admin, getAllOrders);
router.put('/:id/status', auth, admin, updateOrderStatus);

module.exports = router;
