const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback } = require('../controllers/feedbackController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', submitFeedback);
router.get('/', auth, admin, getAllFeedback);

module.exports = router;
