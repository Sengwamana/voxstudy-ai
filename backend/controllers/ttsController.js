// backend/controllers/ttsController.js
const { generateSpeechStream } = require('../services/elevenLabsService');

const handleTTS = async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    
    const audioStream = await generateSpeechStream(text, voiceId);

    // Stream headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Handle Node.js Streams (node-fetch v2/v3 in Node env)
    if (audioStream.pipe && typeof audioStream.pipe === 'function') {
        audioStream.pipe(res);
        return;
    } 
    
    // Handle Web Standard Streams (Node 18+ native fetch)
    if (audioStream.getReader && typeof audioStream.getReader === 'function') {
        const reader = audioStream.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
        }
        res.end();
        return;
    }

    throw new Error("Unknown stream type returned from TTS service");

  } catch (error) {
    // Only log full error for unexpected issues, not quota (which is expected)
    if (error.code !== 'QUOTA_EXCEEDED') {
      console.error("TTS Controller Error:", error);
    }
    
    // If headers haven't been sent, handling errors
    if (!res.headersSent) {
      if (error.code === 'QUOTA_EXCEEDED') {
        // Send specific 429 error for frontend to handle gracefully
        return res.status(429).json({
          error: "Voice quota exceeded. Switching to backup voice.",
          code: "QUOTA_EXCEEDED"
        });
      }

      return res.status(500).json({ 
        error: "Voice generation failed. Please try reading the text instead." 
      });
    }
    res.end();
  }
};

module.exports = { handleTTS };