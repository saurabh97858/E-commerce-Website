const express = require('express');
const router = express.Router();
const { getDashboard, getReports, getAdmins, createAdmin } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superAdmin = require('../middleware/superAdmin');

router.get('/dashboard', auth, admin, getDashboard);
router.get('/reports', auth, admin, getReports);

// Super Admin routes
router.get('/admins', auth, superAdmin, getAdmins);
router.post('/create-admin', auth, superAdmin, createAdmin);

module.exports = router;
