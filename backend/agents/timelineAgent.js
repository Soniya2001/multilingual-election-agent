const electionData = require('../data/electionData.json');
const { generateWithFallback } = require('../services/geminiService');

const getTimeline = (context) => {
  const countryData = electionData[context.country.toLowerCase()] || electionData["india"];
  return countryData.timeline.upcoming_dates;
};

module.exports = { getTimeline };
