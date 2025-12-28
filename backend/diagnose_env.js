const fs = require('fs');
const path = require('path');
const config = require('./config/config'); // This will load .env

console.log("--- DIAGNOSIS START ---");
console.log(`Node Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${config.port}`);

const geminiKey = config.gemini.apiKey;
if (!geminiKey) {
    console.error("❌ ERROR: Gemini API Key is MISSING.");
} else {
    console.log("✅ Gemini API Key is set.");
}

const elevenLabsKey = config.elevenLabs.apiKey;
if (!elevenLabsKey) {
    console.warn("⚠️ WARNING: ElevenLabs API Key is MISSING. TTS will fail.");
} else {
    console.log("✅ ElevenLabs API Key is set.");
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log("✅ node_modules found.");
} else {
    console.error("❌ ERROR: node_modules NOT found. Run 'npm install'.");
}

console.log("--- DIAGNOSIS END ---");
