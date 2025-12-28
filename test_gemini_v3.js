const path = require('path');
require(path.join(__dirname, 'backend', 'node_modules', 'dotenv')).config();
const { GoogleGenAI } = require("@google/genai");

async function testGemini() {
  const apiKey = process.env.API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  console.log(`Using Key: ${apiKey ? '***' + apiKey.slice(-4) : 'MISSING'}`);
  console.log(`Using Model: ${modelName}`);

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    console.log("Testing generation with systemInstruction...");
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: "Hello, explain gravity briefly." }] }],
      config: {
        systemInstruction: "You are a helpful physics tutor.",
        temperature: 0.7
      }
    });

    console.log("Response:", response.text);
    console.log("SUCCESS: Gemini API is working!");
  } catch (error) {
    console.error("FAILURE: Gemini API Test Failed:", error);
  }
}

testGemini();
