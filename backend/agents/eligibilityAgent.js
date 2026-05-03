const electionData = require('../data/electionData.json');
const { generateWithFallback } = require('../services/geminiService');
require('dotenv').config();


const AGENT_META = {
  id: 'eligibility',
  name: 'Eligibility Agent',
  tamilName: 'தகுதி முகவர்',
  icon: '✅',
  color: '#A34FF7'
};

async function respond(userQuery, language) {
  const knowledgeBase = JSON.stringify(electionData.eligibility_details);

  const prompt = `
You are the Eligibility Agent of India's Election Assistant.
You are a DEEP EXPERT in Indian voter eligibility — minimum age (18 years), citizenship requirements,
residency rules, NRI/overseas voter rights, facilities for Persons with Disabilities (PwD),
senior citizen voting provisions, first-time voter guidance, and grounds for disqualification.

LANGUAGE RULE: Respond ENTIRELY in ${language}.
- If language is "Tamil", write the full response in Tamil script (தமிழ்). Do NOT mix English unless it's a proper noun.
- If language is "Hindi", write the full response in Hindi script (हिन्दी). Do NOT mix English unless it's a proper noun.
- If language is "English", respond clearly in English.

KNOWLEDGE BASE:
${knowledgeBase}

RESPONSE FORMAT — Return ONLY valid JSON, no markdown, no extra text:
{
  "text": "Main response answering the eligibility question",
  "steps": ["Eligibility criterion 1", "Eligibility criterion 2"],
  "tip": "Helpful tip or important note"
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
    console.error('Eligibility Agent error:', error.message);
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
