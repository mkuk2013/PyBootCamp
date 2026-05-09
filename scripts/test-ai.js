const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const models = await genAI.getGenerativeModel({ model: "gemini-pro" }); // placeholder
  // The SDK doesn't have a direct listModels, but we can try to find the error details
  console.log("Checking API key...");
  try {
     // Try a simple request with a versioned model
     const result = await genAI.getGenerativeModel({ model: "models/gemini-pro" }).generateContent("test");
     console.log("models/gemini-pro works!");
  } catch (e) {
     console.log("Error:", e.message);
  }
}

listModels();
