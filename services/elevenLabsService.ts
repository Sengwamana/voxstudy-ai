// services/elevenLabsService.ts

export const generateSpeech = async (
  _apiKey: string, // Kept for compatibility
  voiceId: string,
  text: string
): Promise<string> => {
  
  // 1. Try Backend TTS
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch('/api/tts', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Check for Quota Exceeded (429)
    if (response.status === 429) {
      const errorData = await response.json();
      const error = new Error(errorData.error || "ElevenLabs Quota Exceeded");
      (error as any).code = "QUOTA_EXCEEDED";
      throw error;
    }

    const contentType = response.headers.get("content-type");
    if (!response.ok || (contentType && contentType.includes("text/html"))) {
       throw new Error("Backend TTS unavailable");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
    
  } catch (backendError) {
    console.warn("Backend TTS failed, trying direct API...", backendError);

    // 2. Client-Side Fallback (Direct ElevenLabs API)
    if (process.env.ELEVENLABS_API_KEY) {
      try {
         const directResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
          {
            method: "POST",
            headers: {
              "Accept": "audio/mpeg",
              "Content-Type": "application/json",
              "xi-api-key": process.env.ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text: text,
              model_id: "eleven_multilingual_v2",
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
          }
        );

        if (!directResponse.ok) throw new Error("Direct API failed");
        
        const blob = await directResponse.blob();
        return URL.createObjectURL(blob);
      } catch (directError) {
         console.error("Direct TTS failed:", directError);
         throw directError; // Fallback to browser TTS in App.tsx
      }
    }
    
    throw backendError; // Trigger App.tsx fallback
  }
};