// backend/routes/api.js
const express = require('express');
const router = express.Router();

const { handleChat } = require('../controllers/chatController');
const { handleTTS } = require('../controllers/ttsController');
const { apiLimiter, validateChatRequest, validateTTSRequest } = require('../middleware/security');
const config = require('../config/config');

// Config Endpoint (Public IDs)
router.get('/config', (req, res) => {
  res.json({
    elevenLabsVoiceId: config.elevenLabs.defaultVoiceId,
    elevenLabsAgentId: config.elevenLabs.agentId
  });
});

// Chat Endpoint
router.post('/chat', apiLimiter, validateChatRequest, handleChat);

// TTS Endpoint
router.post('/tts', apiLimiter, validateTTSRequest, handleTTS);

module.exports = router;