const express = require('express');
const router = express.Router();
const { getDashboard, getReports } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/dashboard', auth, admin, getDashboard);
router.get('/reports', auth, admin, getReports);

module.exports = router;
