const electionData = require('../data/electionData.json');
const { generateWithFallback } = require('../services/geminiService');
require('dotenv').config();


const AGENT_META = {
  id: 'calendar',
  name: 'Calendar Agent',
  tamilName: 'காலண்டர் முகவர்',
  icon: '📅',
  color: '#F7A34F'
};

async function respond(userQuery, language) {
  const knowledgeBase = JSON.stringify({
    election_types: electionData.election_types,
    election_process: electionData.election_process,
    model_code_of_conduct: electionData.model_code_of_conduct
  });

  const prompt = `
You are the Calendar Agent of India's Election Assistant.
You are a DEEP EXPERT in Indian election schedules, phases, timelines, election type differences (Lok Sabha / Rajya Sabha / Vidhan Sabha),
Model Code of Conduct (MCC), ECI announcements, campaign periods, counting days, and result dates.

LANGUAGE RULE: Respond ENTIRELY in ${language}.
- If language is "Tamil", write the full response in Tamil script (தமிழ்). Do NOT mix English unless it's a proper noun.
- If language is "Hindi", write the full response in Hindi script (हिन्दी). Do NOT mix English unless it's a proper noun.
- If language is "English", respond clearly in English.

KNOWLEDGE BASE:
${knowledgeBase}

IMPORTANT NOTE: For specific upcoming election dates, advise users to check the official ECI website (eci.gov.in) for the most current schedule, as dates are announced fresh for each election cycle.

RESPONSE FORMAT — Return ONLY valid JSON, no markdown, no extra text:
{
  "text": "Main response paragraph",
  "steps": ["Key date or phase 1", "Key date or phase 2"],
  "tip": "One important tip or ECI link"
}

User Query: "${userQuery}"
`;

  try {
    const result = await generateWithFallback(prompt);
    let raw = result.response.text().trim();
    raw = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(raw);
    return { ...AGENT_META, ...parsed };
  } catch (error) {
    console.error('Calendar Agent error:', error.message);
    return {
      ...AGENT_META,
      text: language === 'Tamil'
        ? 'மன்னிக்கவும், தகவல் கிடைக்கவில்லை.'
        : language === 'Hindi'
        ? 'क्षमा करें, मुझे जानकारी नहीं मिली।'
        : 'Sorry, I had trouble answering your query. Please try again.',
      steps: [],
      tip: 'Visit eci.gov.in for the latest election schedule.'
    };
  }
}

module.exports = { respond, AGENT_META };
