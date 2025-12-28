// backend/controllers/chatController.js
const { generateTutorResponse } = require('../services/geminiService');

const handleChat = async (req, res) => {
  try {
    const { message, history, mode } = req.body;
    // Input is already validated by middleware (message existence/length)
    
    // Pass history and mode to the service to enable context-aware and multimodal responses
    const responseText = await generateTutorResponse(message, history, mode);
    
    return res.json({ 
      text: responseText,
      timestamp: Date.now() 
    });
    
  } catch (error) {
    console.error("Chat Controller Error:", error);
    
    // 🛡️ PRODUCTION SAFETY: Graceful Degradation
    // Instead of a 500 error that breaks the UI, return a safe fallback message.
    // This allows the app to feel "alive" even if the AI backend hiccups.
    return res.status(200).json({ 
      text: "I'm having a little trouble connecting to my knowledge base right now. Could you please ask that again in a moment?",
      timestamp: Date.now(),
      isFallback: true
    });
  }
};

module.exports = { handleChat };