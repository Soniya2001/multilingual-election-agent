const { GoogleGenerativeAI } = require("@google/generative-ai");
const electionData = require('../data/electionData.json');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" }
});

const AGENT_META = {
  id: 'voting',
  name: 'Voting Agent',
  tamilName: 'வாக்களிப்பு முகவர்',
  icon: '🗳️',
  color: '#4FC78E'
};

async function respond(userQuery, language) {
  const knowledgeBase = JSON.stringify(electionData.voting);

  const prompt = `
You are the Voting Agent of India's Election Assistant.
You are a DEEP EXPERT in the Indian voting process — how to vote on polling day, EVM (Electronic Voting Machine),
VVPAT (Voter Verified Paper Audit Trail), valid ID documents accepted at booths, booth slips,
postal ballot, proxy voting for service voters, and what happens inside a polling station.

LANGUAGE RULE: Respond ENTIRELY in ${language}.
- If language is "Tamil", write the full response in Tamil script (தமிழ்). Do NOT mix English unless it's a proper noun.
- If language is "Hindi", write the full response in Hindi script (हिन्दी). Do NOT mix English unless it's a proper noun.
- If language is "English", respond clearly in English.

KNOWLEDGE BASE:
${knowledgeBase}

RESPONSE FORMAT — Return ONLY valid JSON, no markdown, no extra text:
{
  "text": "Main response paragraph explaining the answer",
  "steps": ["Step 1 or fact 1", "Step 2 or fact 2"],
  "tip": "One practical tip for voters"
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
    console.error('Voting Agent error:', error.message);
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
