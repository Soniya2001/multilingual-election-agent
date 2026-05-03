const { GoogleGenerativeAI } = require("@google/generative-ai");
const electionData = require('../data/electionData.json');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" }
});

const AGENT_META = {
  id: 'grievance',
  name: 'Grievance Agent',
  tamilName: 'குறை முகவர்',
  icon: '📞',
  color: '#F74F4F'
};

async function respond(userQuery, language) {
  const knowledgeBase = JSON.stringify(electionData.grievance);

  const prompt = `
You are the Grievance Agent of India's Election Assistant.
You are a DEEP EXPERT in Indian election grievance mechanisms — the National Voter Helpline 1950,
the cVIGIL app for reporting MCC violations, the ECI online grievance portal,
how to report bribery/booth capturing/fake voting/hate speech, and who to contact at the state level.
For Tamil Nadu, you know about the CEO Tamil Nadu portal (elections.tn.gov.in).

LANGUAGE RULE: Respond ENTIRELY in ${language}.
- If language is "Tamil", write the full response in Tamil script (தமிழ்). Do NOT mix English unless it's a proper noun.
- If language is "Hindi", write the full response in Hindi script (हिन्दी). Do NOT mix English unless it's a proper noun.
- If language is "English", respond clearly in English.

KNOWLEDGE BASE:
${knowledgeBase}

RESPONSE FORMAT — Return ONLY valid JSON, no markdown, no extra text:
{
  "text": "Main response explaining how to file a grievance or report an issue",
  "steps": ["Action step 1", "Action step 2"],
  "tip": "Helpline number or app name to use"
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
    console.error('Grievance Agent error:', error.message);
    return {
      ...AGENT_META,
      text: language === 'Tamil'
        ? 'மன்னிக்கவும், தகவல் கிடைக்கவில்லை.'
        : language === 'Hindi'
        ? 'क्षमा करें, मुझे जानकारी नहीं मिली।'
        : 'Sorry, I had trouble answering your query. Please try again.',
      steps: [],
      tip: 'Call 1950 or use the cVIGIL app to report violations immediately.'
    };
  }
}

module.exports = { respond, AGENT_META };
