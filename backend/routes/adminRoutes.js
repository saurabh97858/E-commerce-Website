const express = require('express');
const router = express.Router();
const { getDashboard, getReports, getAdmins, createAdmin, updateAdmin, deleteAdmin } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superAdmin = require('../middleware/superAdmin');

router.get('/dashboard', auth, admin, getDashboard);
router.get('/reports', auth, admin, getReports);

// Super Admin routes
router.get('/admins', auth, superAdmin, getAdmins);
router.post('/create-admin', auth, superAdmin, createAdmin);
router.put('/update-admin/:id', auth, superAdmin, updateAdmin);
router.delete('/delete-admin/:id', auth, superAdmin, deleteAdmin);

module.exports = router;
