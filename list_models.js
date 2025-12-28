require('./backend/node_modules/dotenv').config();
const { GoogleGenAI } = require("./backend/node_modules/@google/genai");

async function listModels() {
    console.log("Listing models...");
    const key = process.env.API_KEY;
    if (!key) {
        console.error("No key found!");
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: key });
        
        console.log("Fetching available models...");
        const response = await ai.models.list();
        
        // The response might be an array or have a models property depending on version
        // Based on new SDK docs, it usually returns { models: [...] }
        
        const models = response.models || response;
        
        if (Array.isArray(models)) {
            console.log(`Found ${models.length} models:`);
            models.forEach(m => {
                // Filter for generateContent support
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                     console.log(`- ${m.name} (Display: ${m.displayName})`);
                }
            });
        } else {
            console.log("Unexpected response format:", JSON.stringify(response, null, 2));
        }

    } catch (error) {
        console.error("Error listing models:", error.message);
        console.error("Full Error:", JSON.stringify(error, null, 2));
    }
}

listModels();
