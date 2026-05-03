const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const primaryModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite",
  generationConfig: { responseMimeType: "application/json" }
});

const fallbackModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" }
});

async function generateWithFallback(prompt) {
  try {
    const result = await primaryModel.generateContent(prompt);
    return result;
  } catch (error) {
    console.warn(`[GeminiService] Primary model (2.5-flash-lite) failed: ${error.message}. Triggering robust fallback to gemini-2.0-flash...`);
    try {
      const fallbackResult = await fallbackModel.generateContent(prompt);
      return fallbackResult;
    } catch (fallbackError) {
      console.error(`[GeminiService] Fallback model also failed: ${fallbackError.message}`);
      throw fallbackError;
    }
  }
}

module.exports = { generateWithFallback };
