class PersonalizationAgent {
  constructor() {
    this.context = {
      country: "India",
      state: "",
      language: "English",
      firstTimeVoter: false
    };
  }

  updateContext(newContext) {
    this.context = { ...this.context, ...newContext };
    return this.context;
  }

  getContext() {
    return this.context;
  }
}

module.exports = new PersonalizationAgent();
