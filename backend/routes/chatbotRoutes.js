const express = require('express');
const router = express.Router();
const { handleChatQuery, getChatHistory, clearChatHistory } = require('../controllers/chatbotController');
const auth = require('../middleware/auth');

// POST /api/chatbot - Send message to AI assistant
router.post('/', auth.optional, handleChatQuery);

// GET /api/chatbot/history - Retrieve persistent chat history
router.get('/history', auth.optional, getChatHistory);

// POST /api/chatbot/clear - Clear chat history
router.post('/clear', auth.optional, clearChatHistory);

module.exports = router;
