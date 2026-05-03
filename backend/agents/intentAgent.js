const INTENTS = {
  REGISTER_TO_VOTE: "REGISTER_TO_VOTE",
  VOTING_PROCESS: "VOTING_PROCESS",
  DOCUMENTS: "DOCUMENTS",
  ELIGIBILITY: "ELIGIBILITY",
  TIMELINE: "TIMELINE",
  GENERAL_QUERY: "GENERAL_QUERY"
};

const detectIntent = (userInput) => {
  const input = userInput.toLowerCase();
  
  if (input.includes("register") || input.includes("form 6") || input.includes("how to apply")) {
    return INTENTS.REGISTER_TO_VOTE;
  }
  if (input.includes("process") || input.includes("how to vote") || input.includes("polling")) {
    return INTENTS.VOTING_PROCESS;
  }
  if (input.includes("document") || input.includes("id proof") || input.includes("aadhaar") || input.includes("passport")) {
    return INTENTS.DOCUMENTS;
  }
  if (input.includes("eligible") || input.includes("qualification") || input.includes("can i vote")) {
    return INTENTS.ELIGIBILITY;
  }
  if (input.includes("date") || input.includes("when") || input.includes("timeline") || input.includes("schedule")) {
    return INTENTS.TIMELINE;
  }
  
  return INTENTS.GENERAL_QUERY;
};

module.exports = { detectIntent, INTENTS };
