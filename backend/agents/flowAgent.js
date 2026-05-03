const processResponse = (response) => {
  if (response.steps && response.steps.length > 0) {
    const formattedSteps = response.steps.map((step, index) => `Step ${index + 1} → ${step}`);
    return { ...response, steps: formattedSteps };
  }
  return response;
};

module.exports = { processResponse };
