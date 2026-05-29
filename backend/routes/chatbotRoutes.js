const express = require('express');
const router = express.Router();
const { handleChatQuery } = require('../controllers/chatbotController');

// POST /api/chatbot - Send message to AI assistant
router.post('/', handleChatQuery);

module.exports = router;
