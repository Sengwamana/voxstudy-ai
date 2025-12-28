import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME, MODE_CONFIGS } from "../constants";
import { HistoryItem, StudyMode } from "../types";

export const generateTutorResponse = async (
  prompt: string, 
  history: HistoryItem[] = [], 
  mode: StudyMode = 'tutor',
  signal?: AbortSignal
): Promise<string> => {
  console.log(`Frontend: Requesting response (${mode})...`);
  
  // 1. Try Backend API
  try {
    // If external signal is provided, use it. Otherwise, create a timeout controller.
    // Note: To combine signals properly requires complex logic or a polyfill, 
    // so we prioritize the cancellation signal if passed, or default to timeout.
    let fetchOptions: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: prompt,
          history: history.slice(0, 3), 
          mode: mode
        })
    };

    if (signal) {
        fetchOptions.signal = signal;
    } else {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 12000); // Default timeout
        fetchOptions.signal = controller.signal;
    }

    const response = await fetch('/api/chat', fetchOptions);

    const contentType = response.headers.get("content-type");
    if (!response.ok || (contentType && contentType.includes("text/html"))) {
      throw new Error("Backend unavailable");
    }

    const data = await response.json();
    return data.text;

  } catch (backendError: any) {
    if (backendError.name === 'AbortError') {
        throw backendError; // Propagate cancellation
    }
    
    console.warn("Switching to Client-Side Fallback:", backendError);

    // 2. Client-Side Fallback
    try {
      if (!process.env.API_KEY) {
        throw new Error("No API Key available for fallback");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contextParts = history.slice(0, 3).reverse().map(turn => [
        { role: 'user', parts: [{ text: turn.question }] },
        { role: 'model', parts: [{ text: turn.answer }] }
      ]).flat();

      const contents = [
        ...contextParts,
        { role: 'user', parts: [{ text: prompt }] }
      ];

      const response = await ai.models.generateContent({
        model: MODEL_NAME || 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction: MODE_CONFIGS[mode].instruction,
          maxOutputTokens: 300,
        }
      });

      if (!response.text) throw new Error("Empty response from AI");
      return response.text;

    } catch (clientError: any) {
      console.error("Critical Error:", clientError);
      return "I'm having trouble connecting right now. Please check your internet connection.";
    }
  }
};