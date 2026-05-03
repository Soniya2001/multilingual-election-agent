const { GoogleGenerativeAI } = require("@google/generative-ai");
const electionData = require('../data/electionData.json');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" }
});

const AGENT_META = {
  id: 'constituency',
  name: 'Constituency Agent',
  tamilName: 'தொகுதி முகவர்',
  icon: '🏛️',
  color: '#4FF7F0'
};

async function respond(userQuery, language) {
  const knowledgeBase = JSON.stringify(electionData.constituencies);

  const prompt = `
You are the Constituency Agent of India's Election Assistant.
You are a DEEP EXPERT in Indian electoral constituencies — the difference between Lok Sabha (Parliament),
Rajya Sabha (Upper House), and Vidhan Sabha (State Assembly), how constituencies are delimited by the
Delimitation Commission, reserved seats for SC/ST, how to find your constituency, total seats,
and specific Tamil Nadu constituency information (39 Lok Sabha, 234 Vidhan Sabha seats).

LANGUAGE RULE: Respond ENTIRELY in ${language}.
- If language is "Tamil", write the full response in Tamil script (தமிழ்). Do NOT mix English unless it's a proper noun.
- If language is "Hindi", write the full response in Hindi script (हिन्दी). Do NOT mix English unless it's a proper noun.
- If language is "English", respond clearly in English.

KNOWLEDGE BASE:
${knowledgeBase}

RESPONSE FORMAT — Return ONLY valid JSON, no markdown, no extra text:
{
  "text": "Main response about the constituency question",
  "steps": ["Key fact 1", "Key fact 2"],
  "tip": "How to find your constituency or a relevant link"
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
    console.error('Constituency Agent error:', error.message);
    return {
      ...AGENT_META,
      text: language === 'Tamil'
        ? 'மன்னிக்கவும், தகவல் கிடைக்கவில்லை.'
        : language === 'Hindi'
        ? 'क्षमा करें, मुझे जानकारी नहीं मिली।'
        : 'Sorry, I had trouble answering your query. Please try again.',
      steps: [],
      tip: 'Visit voters.eci.gov.in to find your polling station and constituency.'
    };
  }
}

module.exports = { respond, AGENT_META };
