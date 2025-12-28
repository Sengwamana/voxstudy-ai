require('./backend/node_modules/dotenv').config();
const { GoogleGenAI } = require("./backend/node_modules/@google/genai");

async function testKey() {
    console.log("Testing Gemini API Key...");
    const key = process.env.API_KEY;
    console.log("Key loaded:", key ? key.substring(0, 10) + "..." : "UNDEFINED");

    if (!key) {
        console.error("No key found!");
        return;
    }

    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-2.0-flash-exp"
    ];

    for (const model of modelsToTry) {
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            await ai.models.generateContent({
                model: model,
                contents: [{ role: 'user', parts: [{ text: "hi" }] }]
            });
            console.log(`PASS|${model}`); // distinct marker
            return; 
        } catch (error) {
            console.log(`FAIL|${model}|${error.status}`);
        }
    }
    console.log("\nAll models failed.");
}

testKey();
