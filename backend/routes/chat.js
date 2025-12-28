const express = require('express');
const router = express.Router();
const { generateTutorResponse } = require('../services/geminiService');

router.post('/', async (req, res) => {
  try {
    const { message, history, mode } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Pass optional history and mode
    const response = await generateTutorResponse(message, history || [], mode || 'tutor');
    res.json({ text: response });
    
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;