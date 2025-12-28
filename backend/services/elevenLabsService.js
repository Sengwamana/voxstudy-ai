// backend/services/elevenLabsService.js
const config = require("../config/config");

// Native fetch is available in Node 18+ or via polyfill
const generateSpeechStream = async (text, voiceId) => {
  const targetVoiceId = voiceId || config.elevenLabs.defaultVoiceId;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}/stream`,
    {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": config.elevenLabs.apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    
    if (response.status === 401) {
       console.warn(`ElevenLabs API Warning: ${response.status} - ${errorText.substring(0, 50)}...`);
    } else {
       console.error("ElevenLabs API Error:", response.status, errorText);
    }

    // Check for quota exceeded
    if (response.status === 401 && errorText.includes("quota_exceeded")) {
      console.warn("ElevenLabs Quota Exceeded (handled gracefully)");
      const error = new Error("ElevenLabs Quota Exceeded");
      error.code = "QUOTA_EXCEEDED";
      error.status = 429; // Use 429 Too Many Requests for quota issues
      throw error;
    }

    throw new Error(`TTS Provider Error: ${response.status} - ${errorText.substring(0, 100)}`);
  }

  // Return the body stream directly
  return response.body;
};

module.exports = { generateSpeechStream };