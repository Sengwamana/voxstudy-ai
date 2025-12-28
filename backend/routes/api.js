// backend/routes/api.js
const express = require('express');
const router = express.Router();

const { handleChat } = require('../controllers/chatController');
const { handleTTS } = require('../controllers/ttsController');
const { apiLimiter, validateChatRequest, validateTTSRequest } = require('../middleware/security');

// Chat Endpoint
router.post('/chat', apiLimiter, validateChatRequest, handleChat);

// TTS Endpoint
router.post('/tts', apiLimiter, validateTTSRequest, handleTTS);

module.exports = router;