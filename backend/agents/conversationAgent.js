const handleFallback = (userInput) => {
  return {
    text: "I'm not sure I understood that perfectly. I can help you with voter registration, eligibility, documents, or election dates. Could you please rephrase?",
    steps: []
  };
};

module.exports = { handleFallback };
