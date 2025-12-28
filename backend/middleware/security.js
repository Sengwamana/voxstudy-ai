// backend/middleware/security.js

// Simple in-memory rate limiter (Token Bucket lite)
// For production scaling beyond one instance, use Redis.
// For a hackathon/single-container, this is sufficient.
const rateLimit = new Map();

const rateLimiter = (windowMs, maxRequests) => (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  const client = rateLimit.get(ip) || { count: 0, startTime: now };
  
  if (now - client.startTime > windowMs) {
    // Reset window
    client.count = 1;
    client.startTime = now;
  } else {
    client.count++;
  }
  
  rateLimit.set(ip, client);
  
  if (client.count > maxRequests) {
    return res.status(429).json({ error: "Too many requests, please try again later." });
  }
  
  next();
};

const validateChatRequest = (req, res, next) => {
  const { message } = req.body;
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: "Invalid message format." });
  }
  
  if (message.trim().length === 0) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }
  
  if (message.length > 1000) {
    return res.status(400).json({ error: "Message too long (max 1000 chars)." });
  }
  
  // Basic sanitization (trim)
  req.body.message = message.trim();
  next();
};

const validateTTSRequest = (req, res, next) => {
  const { text } = req.body;
  
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: "Invalid text format." });
  }
  
  if (text.length > 5000) {
    return res.status(400).json({ error: "Text too long for TTS." });
  }
  
  next();
};

module.exports = {
  apiLimiter: rateLimiter(60 * 1000, 20), // 20 requests per minute
  validateChatRequest,
  validateTTSRequest
};