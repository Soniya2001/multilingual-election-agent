const electionData = require('../data/electionData.json');
const { generateWithFallback } = require('../services/geminiService');

const getInfo = (intent, context) => {
  const countryData = electionData[context.country.toLowerCase()] || electionData["india"];
  
  switch (intent) {
    case "REGISTER_TO_VOTE":
      return {
        text: "Registering to vote is easy!",
        steps: countryData.registration.process
      };
    case "DOCUMENTS":
      return {
        text: "You will need the following documents for registration:",
        steps: countryData.registration.documents
      };
    case "ELIGIBILITY":
      return {
        text: "Here are the eligibility criteria to vote:",
        steps: countryData.registration.eligibility
      };
    case "TIMELINE":
      return {
        text: "Keep track of these important dates:",
        steps: countryData.timeline.upcoming_dates.map(d => `${d.event}: ${d.date}`)
      };
    default:
      return {
        text: "I can help you with registration, documents, eligibility, and election timelines. What would you like to know?",
        steps: []
      };
  }
};

module.exports = { getInfo };
