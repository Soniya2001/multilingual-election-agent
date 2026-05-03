require('dotenv').config();


/**
 * Orchestrator Agent
 * Reads the user's query and routes it to the correct specialist agent.
 * Returns one of: registration | calendar | voting | eligibility | constituency | grievance
 */
async function routeQuery(userQuery) {
  const prompt = `
You are a smart query router for an India Election Assistant chatbot.
Your ONLY job is to classify the user's query into exactly ONE of these categories:

1. "registration"   — Voter ID, Form 6, NVSP portal, e-EPIC, Aadhaar linking, new voter registration, voter list, overseas voter
2. "calendar"       — Election dates, schedule, phases, Model Code of Conduct (MCC), election announcement, counting day, polling dates
3. "voting"         — How to vote, EVM, VVPAT, polling booth, what to bring, indelible ink, postal ballot, proxy voting, booth slip
4. "eligibility"    — Age limit, citizenship, NRI voters, PwD facilities, disqualification, first-time voter, senior citizen voting
5. "constituency"   — Lok Sabha, Rajya Sabha, Vidhan Sabha, MLA, MP, delimitation, how many seats, find my constituency, Tamil Nadu seats
6. "grievance"      — Complaint, report, 1950 helpline, cVIGIL app, bribery, booth capturing, MCC violation, fake news reporting

Rules:
- Reply with ONLY the single lowercase category word. No punctuation, no explanation.
- If uncertain, default to "voting".

User Query: "${userQuery}"
`;

  try {
    const result = await generateWithFallback(prompt);
    const raw = result.response.text().trim().toLowerCase().replace(/[^a-z]/g, '');
    const validRoutes = ['registration', 'calendar', 'voting', 'eligibility', 'constituency', 'grievance'];
    return validRoutes.includes(raw) ? raw : 'voting';
  } catch (error) {
    console.error('Orchestrator routing error:', error.message);
    return 'voting'; // safe fallback
  }
}

module.exports = { routeQuery };
