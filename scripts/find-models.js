require('dotenv').config({ path: '.env.local' });

async function discoverModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log("Testing API Key for available models...");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.log("API Error:", data.error.message);
      return;
    }
    
    console.log("AVAILABLE MODELS:");
    data.models.forEach(m => {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`- ${m.name}`);
      }
    });
  } catch (e) {
    console.log("Connection Error:", e.message);
  }
}

discoverModels();
