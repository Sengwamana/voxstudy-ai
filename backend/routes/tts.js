const express = require('express');
const router = express.Router();
const { generateSpeechStream } = require('../services/elevenLabsService');

router.post('/', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Get the readable web stream from the service
    const audioStream = await generateSpeechStream(text, voiceId);

    // Set appropriate headers
    res.setHeader('Content-Type', 'audio/mpeg');
    
    // Convert Web Stream to Node Stream and pipe to response
    // Node 18+ fetch returns a web ReadableStream, we need to handle it.
    // Ideally we iterate chunks.
    const reader = audioStream.getReader();
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
    }
    res.end();

  } catch (error) {
    console.error('TTS API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;