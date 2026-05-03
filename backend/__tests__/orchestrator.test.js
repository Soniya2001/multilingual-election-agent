// We will mock the Gemini API to test the orchestrator logic
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockImplementation(async (prompt) => {
            // Simple mock: Extract user query and test it
            const match = prompt.match(/User Query: "(.*?)"/);
            const userQuery = match ? match[1].toLowerCase() : '';
            
            let agentId = 'voting';
            if (userQuery.includes('register')) agentId = 'registration';
            if (userQuery.includes('date')) agentId = 'calendar';
            if (userQuery.includes('age')) agentId = 'eligibility';
            if (userQuery.includes('mla')) agentId = 'constituency';
            if (userQuery.includes('complain')) agentId = 'grievance';
            
            return {
              response: {
                // Mock text() to return just the string
                text: () => agentId
              }
            };
          })
        })
      };
    })
  };
});

const { routeQuery } = require('../agents/orchestratorAgent');

describe('Orchestrator Agent', () => {
  it('should route "how to register" to registration agent', async () => {
    const agent = await routeQuery("how to register for voting?");
    expect(agent).toEqual('registration');
  });

  it('should route "election date" to calendar agent', async () => {
    const agent = await routeQuery("when is the election date?");
    expect(agent).toEqual('calendar');
  });

  it('should route "MLA" to constituency agent', async () => {
    const agent = await routeQuery("who is my MLA?");
    expect(agent).toEqual('constituency');
  });
});
