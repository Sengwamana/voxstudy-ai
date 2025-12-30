// backend/config/config.js
require('dotenv').config();

const config = {
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'development',
  gemini: {
    apiKey: process.env.API_KEY,
    modelName: process.env.GEMINI_MODEL || "gemini-2.5-flash", // Optimized for speed/cost
  },
  elevenLabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
    defaultVoiceId: process.env.ELEVENLABS_VOICE_ID || "7sXif1ZLnLgbMgmFvs2G",
    agentId: process.env.ELEVENLABS_AGENT_ID,
  }
};

// Fail fast if critical keys are missing in production
if (config.env === 'production') {
  if (!config.gemini.apiKey) throw new Error("Missing API_KEY (Gemini)");
  if (!config.elevenLabs.apiKey) throw new Error("Missing ELEVENLABS_API_KEY");
}

module.exports = config;