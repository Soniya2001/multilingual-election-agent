const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { routeQuery } = require('./agents/orchestratorAgent');
const registrationAgent = require('./agents/registrationAgent');
const calendarAgent     = require('./agents/calendarAgent');
const votingAgent       = require('./agents/votingAgent');
const eligibilityAgent  = require('./agents/eligibilityAgent');
const constituencyAgent = require('./agents/constituencyAgent');
const grievanceAgent    = require('./agents/grievanceAgent');
const ttsService        = require('./services/ttsService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5000', 'http://127.0.0.1:5000'] }));
app.use(helmet({ contentSecurityPolicy: false })); // Disabled CSP for inline scripts in dev
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Trust the first proxy (Cloud Run Load Balancer) for rate limiting
app.set('trust proxy', 1);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Agent registry
const AGENT_MAP = {
  registration: registrationAgent,
  calendar:     calendarAgent,
  voting:       votingAgent,
  eligibility:  eligibilityAgent,
  constituency: constituencyAgent,
  grievance:    grievanceAgent
};

// ── Session context (per-user map) ──────────
const sessions = new Map();

function getSession(sessionId) {
  if (!sessionId) return { state: '', language: 'English', firstTimeVoter: false };
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { state: '', language: 'English', firstTimeVoter: false });
  }
  return sessions.get(sessionId);
}

// POST /api/context — save user profile
app.post('/api/context', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const { state, language, firstTimeVoter } = req.body;
  const ctx = getSession(sessionId);
  ctx.state = state !== undefined ? state : ctx.state;
  ctx.language = language !== undefined ? language : ctx.language;
  ctx.firstTimeVoter = firstTimeVoter !== undefined ? firstTimeVoter : ctx.firstTimeVoter;
  
  console.log(`Context set for session [${sessionId}]:`, ctx);
  res.json({ success: true, context: ctx });
});

// POST /api/chat — main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'default';
    const ctx = getSession(sessionId);
    const { message, voiceEnabled } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Empty message' });
    }

    // 1. Orchestrator decides which agent handles this
    const agentId = await routeQuery(message);
    console.log(`[Orchestrator] → Routed to: ${agentId} for session ${sessionId}`);

    // 2. Selected agent generates response
    const agent = AGENT_MAP[agentId];
    const agentResponse = await agent.respond(message, ctx.language);

    // 3. Build TTS text (text + steps combined)
    let audioBase64 = null;
    if (voiceEnabled) {
      const ttsText = [
        agentResponse.text,
        ...(agentResponse.steps || []),
        agentResponse.tip ? `Tip: ${agentResponse.tip}` : ''
      ].filter(Boolean).join('. ');

      const ttsResult = await ttsService.generateSpeech(ttsText, ctx.language);
      audioBase64 = ttsResult.audio;

      if (ttsResult.error) {
        console.warn('TTS warning (fallback to browser):', ttsResult.error);
      }
    }

    // 4. Send response
    res.json({
      agentId:    agentResponse.id,
      agentName:  agentResponse.name,
      tamilName:  agentResponse.tamilName,
      agentIcon:  agentResponse.icon,
      agentColor: agentResponse.color,
      text:       agentResponse.text,
      steps:      agentResponse.steps || [],
      tip:        agentResponse.tip   || '',
      audio:      audioBase64
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', country: 'India', agents: Object.keys(AGENT_MAP) });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🗳️  India Election Agent running → http://localhost:${PORT}`);
    console.log(`🤖  Agents: ${Object.keys(AGENT_MAP).join(', ')}`);
    console.log(`🔑  Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Present' : '❌ MISSING'}\n`);
  });
}

module.exports = app;
