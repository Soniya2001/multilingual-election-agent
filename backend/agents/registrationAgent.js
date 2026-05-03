const { GoogleGenerativeAI } = require("@google/generative-ai");
const electionData = require('../data/electionData.json');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" }
});

const AGENT_META = {
  id: 'registration',
  name: 'Registration Agent',
  tamilName: 'பதிவு முகவர்',
  icon: '📋',
  color: '#4F8EF7'
};

async function respond(userQuery, language) {
  const knowledgeBase = JSON.stringify(electionData.registration);
  const isFirstTimeVoter = /first.?time|new voter|முதல்/i.test(userQuery);

  const prompt = `
You are the Registration Agent of India's Election Assistant.
You are a DEEP EXPERT in Indian voter registration — Form 6, Form 6A, Form 6B, Form 7, Form 8,
the NVSP/Voter portal (voters.eci.gov.in), Aadhaar-Voter ID linking, e-EPIC cards, and overseas voter registration.

LANGUAGE RULE: Respond ENTIRELY in ${language}. 
- If language is "Tamil", write the full response in Tamil script (தமிழ்). Do NOT mix English unless it's a proper noun.
- If language is "Hindi", write the full response in Hindi script (हिन्दी). Do NOT mix English unless it's a proper noun.
- If language is "English", respond clearly in English.

KNOWLEDGE BASE (use this as your ground truth):
${knowledgeBase}

USER CONTEXT:
- First-time voter detected: ${isFirstTimeVoter}
- Country: India (fixed)

YOUR TASK:
Answer the user's query about voter registration accurately and helpfully.
${isFirstTimeVoter ? 'Since this appears to be a first-time voter, be extra welcoming and explain each step clearly.' : ''}

RESPONSE FORMAT — Return ONLY valid JSON, no markdown, no extra text:
{
  "text": "Main response paragraph",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "tip": "One important tip or link (optional, can be empty string)"
}

User Query: "${userQuery}"
`;

  try {
    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
    raw = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(raw);
    return { ...AGENT_META, ...parsed };
  } catch (error) {
    console.error('Registration Agent error:', error.message);
    return {
      ...AGENT_META,
      text: language === 'Tamil'
        ? 'மன்னிக்கவும், தகவல் கிடைக்கவில்லை.'
        : language === 'Hindi'
        ? 'क्षमा करें, मुझे जानकारी नहीं मिली।'
        : 'Sorry, I had trouble answering your query. Please try again.',
      steps: [],
      tip: ''
    };
  }
}

module.exports = { respond, AGENT_META };
