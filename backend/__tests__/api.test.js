const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
    expect(res.body.country).toEqual('India');
    expect(res.body.agents.length).toBe(6);
  });

  it('POST /api/context should save session state', async () => {
    const sessionId = 'test-session-123';
    const payload = {
      state: 'Karnataka',
      language: 'Tamil',
      firstTimeVoter: true
    };

    const res = await request(app)
      .post('/api/context')
      .set('x-session-id', sessionId)
      .send(payload);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.context.state).toEqual('Karnataka');
    expect(res.body.context.language).toEqual('Tamil');
    expect(res.body.context.firstTimeVoter).toBe(true);
  });

  it('POST /api/chat should reject empty messages', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: '   ' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Empty message');
  });

  // Note: We don't fully test /api/chat with a real message here to avoid hitting the Gemini API quota during CI.
  // We will unit test the orchestrator instead.
});
