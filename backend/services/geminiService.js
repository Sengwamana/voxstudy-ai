// backend/services/geminiService.js
const { GoogleGenAI } = require("@google/genai");
const config = require("../config/config");

const generateTutorResponse = async (prompt, history = [], mode = 'tutor') => {
  const MAX_RETRIES = 3;
  let retryCount = 0;

  while (retryCount <= MAX_RETRIES) {
    try {
      if (retryCount > 0) {
        console.log(`Retry attempt ${retryCount} for mode: ${mode}`);
      } else {
        console.log(`Generating (${mode}):`, prompt.substring(0, 50));
      }
      
      if (!config.gemini.apiKey) {
          throw new Error("Gemini API Key is missing on the server.");
      }

      // Initialize the SDK Client
      const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

      // Mode definitions
      const MODES = {
        tutor: `You are VoxStudy, a patient academic tutor. Explain concepts simply using analogies. Keep answers concise (3-5 sentences). Do not use Markdown.`,
        quiz: `You are VoxStudy, a Quiz Master. If the user gives a topic, ask a specific question. If they answer, grade them briefly and ask the next question. Keep it concise. Do not use Markdown.`,
        eli5: `You are VoxStudy. Explain everything as if the user is 5 years old. Use simple analogies. Keep it brief. Do not use Markdown.`
      };
      
      // 1. Construct History
      // Map previous turns to the { role, parts } format expected by the SDK
      const contextParts = history
        .slice(0, 3)
        .reverse()
        .filter(turn => turn.question && turn.answer) // Filter out incomplete turns
        .map(turn => [
          { role: 'user', parts: [{ text: turn.question }] },
          { role: 'model', parts: [{ text: turn.answer }] }
        ])
        .flat();

      // 2. Add Current Prompt
      const contents = [
        ...contextParts,
        { role: 'user', parts: [{ text: prompt }] }
      ];

      // 3. Select System Instruction
      const systemInstruction = MODES[mode] || MODES.tutor;

      // 4. Generate Content with Timeout Race
      // We wrap the SDK call in a race to ensure we don't hang indefinitely if the backend is slow
      const generatePromise = ai.models.generateContent({
          model: config.gemini.modelName,
          contents: contents,
          config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 1024,
          }
      });

      const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Gemini Request Timeout")), 12000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      
      // The SDK provides the text directly via the .text property
      if (!response.text) {
          throw new Error("AI returned an empty response.");
      }

      return response.text;

    } catch (error) {
      // Check for 429 or other retryable errors
      const isRetryable = error.status === 429 || error.status === 503 || (error.message && error.message.includes("429"));
      
      if (isRetryable && retryCount < MAX_RETRIES) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.warn(`Gemini API Error (${error.status || error.message}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      console.error("Gemini Service Error:", error);
      throw error;
    }
  }
};

module.exports = { generateTutorResponse };