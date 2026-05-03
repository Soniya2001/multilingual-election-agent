// ═══════════════════════════════════════════════════
// India Election Assistant — Frontend App
// Features: 6 specialist agents · English + Tamil
//           Voice Input (Mic) · Voice Output (TTS)
// ═══════════════════════════════════════════════════

const API_BASE = '/api';

// ── State ────────────────────────────────────────────
let sessionId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
let userContext = {
  state:          'Tamil Nadu',
  language:       'English',
  firstTimeVoter: false
};
let voiceOutputEnabled = false;
let isRecording        = false;
let recognition        = null;
let currentAudio       = null;

// ── UI Translations ───────────────────────────────────
const UI_TEXT = {
  English: {
    placeholder:     'Ask about elections in India...',
    listening:       'Listening...',
    thinking:        'Finding the right agent...',
    welcome:         (state) => `Welcome! I'm your India Election Assistant. I'll guide you through everything about elections in India${state ? ` (${state})` : ''}. Ask me anything!`,
    voiceOn:         'Voice On',
    voiceOff:        'Voice Off',
    replay:          '🔁 Replay',
    tip:             '💡 Tip:',
    noSupport:       'Voice input is not supported in this browser. Please use Chrome.',
    errorConnect:    'Unable to connect to the server. Please make sure the backend is running.',
    errorGeneral:    'Sorry, something went wrong. Please try again.',
  },
  Tamil: {
    placeholder:     'இந்தியா தேர்தல் பற்றி கேளுங்கள்...',
    listening:       'கேட்கிறேன்...',
    thinking:        'சரியான முகவரை தேடுகிறேன்...',
    welcome:         (state) => `வணக்கம்! நான் உங்கள் இந்தியா தேர்தல் உதவியாளர். இந்தியா தேர்தல்${state ? ` (${state})` : ''} பற்றி எல்லாவற்றையும் வழிகாட்டுவேன். எதையும் கேளுங்கள்!`,
    voiceOn:         'குரல் இயக்கம்',
    voiceOff:        'குரல் அணைப்பு',
    replay:          '🔁 மீண்டும்',
    tip:             '💡 குறிப்பு:',
    noSupport:       'இந்த உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. Chrome பயன்படுத்தவும்.',
    errorConnect:    'சர்வரை இணைக்க முடியவில்லை. Backend இயங்குகிறதா என்று சரிபார்க்கவும்.',
    errorGeneral:    'மன்னிக்கவும், பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
  },
  Hindi: {
    placeholder:     'भारत के चुनाव के बारे में पूछें...',
    listening:       'सुन रहा हूँ...',
    thinking:        'सही एजेंट ढूंढ रहा हूँ...',
    welcome:         (state) => `नमस्ते! मैं आपका भारत चुनाव सहायक हूँ। मैं आपको भारत के चुनाव${state ? ` (${state})` : ''} के बारे में मार्गदर्शन करूँगा। कुछ भी पूछें!`,
    voiceOn:         'आवाज़ चालू',
    voiceOff:        'आवाज़ बंद',
    replay:          '🔁 दोबारा',
    tip:             '💡 सुझाव:',
    noSupport:       'इस ब्राउज़र में ध्वनि इनपुट समर्थित नहीं है। कृपया Chrome का उपयोग करें।',
    errorConnect:    'सर्वर से कनेक्ट करने में असमर्थ। कृपया सुनिश्चित करें कि बैकएंड चल रहा है।',
    errorGeneral:    'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
  }
};

function t(key, ...args) {
  const lang = userContext.language;
  const val = UI_TEXT[lang]?.[key] ?? UI_TEXT.English[key];
  return typeof val === 'function' ? val(...args) : val;
}

// ── DOM refs ──────────────────────────────────────────
const setupScreen    = document.getElementById('setup-screen');
const chatScreen     = document.getElementById('chat-screen');
const chatBox        = document.getElementById('chat-box');
const userInput      = document.getElementById('user-input');
const sendBtn        = document.getElementById('send-btn');
const micBtn         = document.getElementById('mic-btn');
const stopMicBtn     = document.getElementById('stop-mic-btn');
const recordingBar   = document.getElementById('recording-bar');
const recordingText  = document.getElementById('recording-text');
const startBtn       = document.getElementById('start-btn');
const startBtnText   = document.getElementById('start-btn-text');
const backBtn        = document.getElementById('back-btn');
const voiceOutBtn    = document.getElementById('voice-out-btn');
const voiceOutLabel  = document.getElementById('voice-out-label');
const langPill       = document.getElementById('lang-pill');
const headerSubtitle = document.getElementById('header-subtitle');
const stateSelect    = document.getElementById('state-select');
const langSelect     = document.getElementById('lang-select');

// ── Setup Screen Logic ─────────────────────────────────
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    userContext.firstTimeVoter = btn.dataset.value === 'true';
  });
});

startBtn.addEventListener('click', async () => {
  userContext.state          = stateSelect.value || 'Tamil Nadu';
  userContext.language       = langSelect.value;

  startBtn.disabled = true;
  startBtnText.textContent = '...';

  try {
    const res = await fetch(`${API_BASE}/context`, {
      method:  'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body:    JSON.stringify(userContext)
    });
    const data = await res.json();

    if (data.success) {
      transitionToChat();
    }
  } catch (err) {
    console.error('Context save failed:', err);
    // Still proceed — show chat
    transitionToChat();
  } finally {
    startBtn.disabled = false;
    startBtnText.textContent = startBtnText.dataset.original || 'Start My Guide';
  }
});

langSelect.addEventListener('change', () => {
  const lang = langSelect.value;
  const startTextMap = { Tamil: 'தொடங்கு', Hindi: 'शुरू करें', English: 'Start My Guide' };
  const txt = startTextMap[lang] || 'Start My Guide';
  startBtnText.textContent = txt;
  startBtnText.dataset.original = txt; // Store original text so loading ... can be reverted
  
  // also update voter label
  const voterMap = { Tamil: 'முதல் முறை வாக்காளரா?', Hindi: 'पहली बार मतदाता?', English: 'First-time Voter?' };
  document.getElementById('voter-label').textContent = voterMap[lang] || 'First-time Voter?';
});

function transitionToChat() {
  setupScreen.classList.remove('active');
  setTimeout(() => {
    chatScreen.classList.add('active');
    updateChatHeader();
    addWelcomeMessage();
    userInput.placeholder = t('placeholder');
    applyLanguageFont();
  }, 150);
}

backBtn.addEventListener('click', () => {
  chatScreen.classList.remove('active');
  setTimeout(() => setupScreen.classList.add('active'), 150);
  stopRecording();
});

// ── Header ─────────────────────────────────────────────
function updateChatHeader() {
  headerSubtitle.textContent = `${userContext.state} · ${userContext.language}`;
  const langMap = { English: 'EN', Tamil: 'தமிழ்', Hindi: 'हिंदी' };
  langPill.textContent = langMap[userContext.language] || 'EN';
}

function applyLanguageFont() {
  if (userContext.language === 'Tamil') {
    chatBox.classList.add('lang-tamil');
    userInput.classList.add('lang-tamil');
  } else {
    chatBox.classList.remove('lang-tamil');
    userInput.classList.remove('lang-tamil');
  }
}

// ── Voice Output Toggle ────────────────────────────────
voiceOutBtn.addEventListener('click', () => {
  voiceOutputEnabled = !voiceOutputEnabled;
  voiceOutBtn.classList.toggle('active', voiceOutputEnabled);
  voiceOutBtn.setAttribute('aria-pressed', voiceOutputEnabled.toString());
  voiceOutLabel.textContent = voiceOutputEnabled ? t('voiceOn') : t('voiceOff');
  const icon = voiceOutBtn.querySelector('i');
  icon.className = voiceOutputEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
});

// ── Welcome Message ────────────────────────────────────
function addWelcomeMessage() {
  addAgentMessage({
    agentIcon:  '🗳️',
    agentName:  'India Election Assistant',
    agentColor: '#FF6B35',
    text:       t('welcome', userContext.state),
    steps:      [],
    tip:        userContext.language === 'Tamil'
                  ? 'பதிவு, வாக்களிப்பு, தகுதி, தொகுதி, புகார் — எதையும் கேளுங்கள்!'
                  : 'Try asking: "How do I register to vote?" or "What is EVM?"',
    audio:      null
  });
}

// ── Render Messages ────────────────────────────────────
function addUserMessage(text) {
  const wrap = document.createElement('div');
  wrap.className = 'message user';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  scrollBottom();
}

function addAgentMessage({ agentId, agentIcon, agentName, tamilName, agentColor, text, steps, tip, audio }) {
  const wrap = document.createElement('div');
  wrap.className = 'message agent';

  // Agent badge
  const badge = document.createElement('div');
  badge.className = 'agent-badge';
  const displayName = (userContext.language === 'Tamil' && tamilName) ? tamilName : agentName;
  badge.textContent = `${agentIcon} ${displayName}`;
  badge.style.color            = agentColor;
  badge.style.borderColor      = `${agentColor}55`;
  badge.style.backgroundColor  = `${agentColor}12`;
  wrap.appendChild(badge);

  // Bubble
  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const mainText = document.createElement('p');
  mainText.textContent = text;
  bubble.appendChild(mainText);

  // Steps
  if (steps && steps.length > 0) {
    const stepsList = document.createElement('div');
    stepsList.className = 'steps-list';
    steps.forEach((step, idx) => {
      const item = document.createElement('div');
      item.className = 'step-item';
      const num = document.createElement('span');
      num.className = 'step-num';
      num.textContent = idx + 1;
      const txt = document.createElement('span');
      txt.textContent = step;
      item.appendChild(num);
      item.appendChild(txt);
      stepsList.appendChild(item);
    });
    bubble.appendChild(stepsList);
  }

  // Tip
  if (tip && tip.trim()) {
    const tipBox = document.createElement('div');
    tipBox.className = 'tip-box';
    tipBox.innerHTML = `<i class="fas fa-lightbulb"></i><span>${t('tip')} ${tip}</span>`;
    bubble.appendChild(tipBox);
  }

  wrap.appendChild(bubble);

  // Replay button
  const actions = document.createElement('div');
  actions.className = 'msg-actions';
  const replayBtn = document.createElement('button');
  replayBtn.className = 'replay-btn';
  replayBtn.innerHTML = `<i class="fas fa-redo-alt"></i> ${t('replay')}`;
  replayBtn.addEventListener('click', () => {
    if (audio) {
      playAudio(audio);
    } else {
      speakLocally([text, ...(steps || []), tip ? `${t('tip')} ${tip}` : ''].filter(Boolean).join('. '));
    }
  });
  actions.appendChild(replayBtn);
  wrap.appendChild(actions);

  chatBox.appendChild(wrap);
  scrollBottom();

  // Auto-play audio
  if (voiceOutputEnabled) {
    if (audio) {
      playAudio(audio);
    } else {
      speakLocally([text, ...(steps || []), tip ? `Tip: ${tip}` : ''].filter(Boolean).join('. '));
    }
  }

  return wrap;
}

function addSystemNotice(text) {
  const wrap = document.createElement('div');
  wrap.className = 'message system-notice';
  const bubble = document.createElement('div');
  bubble.className = 'notice-bubble';
  bubble.textContent = text;
  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  scrollBottom();
}

function showTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'typing-indicator';
  wrap.id = 'typing-indicator';
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'typing-dot';
    wrap.appendChild(dot);
  }
  chatBox.appendChild(wrap);
  scrollBottom();
  return wrap;
}

function removeTyping() {
  document.getElementById('typing-indicator')?.remove();
}

function scrollBottom() {
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
}

// ── Send Message ───────────────────────────────────────
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addUserMessage(message);
  userInput.value = '';
  sendBtn.disabled = true;

  const typingEl = showTyping();

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method:  'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body:    JSON.stringify({ message, voiceEnabled: voiceOutputEnabled })
    });

    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();

    removeTyping();
    addAgentMessage(data);

  } catch (err) {
    removeTyping();
    console.error('Send error:', err);
    const isNetErr = err.message.includes('fetch');
    addSystemNotice(isNetErr ? t('errorConnect') : t('errorGeneral'));
  } finally {
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

// ── Audio Playback ─────────────────────────────────────
function playAudio(base64) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  currentAudio = new Audio(`data:audio/mp3;base64,${base64}`);
  currentAudio.play().catch(console.warn);
}

function speakLocally(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt  = new SpeechSynthesisUtterance(text);
  const map  = { English: 'en-IN', Tamil: 'ta-IN', Hindi: 'hi-IN' };
  utt.lang   = map[userContext.language] || 'en-IN';
  utt.rate   = 0.95;
  window.speechSynthesis.speak(utt);
}

// ── Voice Input (Mic) ─────────────────────────────────
function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;

  const rec          = new SR();
  const langMap      = { English: 'en-IN', Tamil: 'ta-IN', Hindi: 'hi-IN' };
  rec.lang           = langMap[userContext.language] || 'en-IN';
  rec.continuous     = false;
  rec.interimResults = true;

  rec.onstart = () => {
    isRecording = true;
    micBtn.classList.add('recording');
    micBtn.setAttribute('aria-pressed', 'true');
    recordingBar.classList.remove('hidden');
    recordingText.textContent = t('listening');
    userInput.value = '';
    userInput.placeholder = t('listening');
  };

  rec.onresult = (e) => {
    let interim = '', final = '';
    for (const r of e.results) {
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    userInput.value = final || interim;
  };

  rec.onend = () => {
    stopRecording();
    if (userInput.value.trim()) {
      sendMessage();
    }
  };

  rec.onerror = (e) => {
    console.error('Speech recognition error:', e.error);
    stopRecording();
  };

  return rec;
}

function stopRecording() {
  isRecording = false;
  micBtn.classList.remove('recording');
  micBtn.setAttribute('aria-pressed', 'false');
  recordingBar.classList.add('hidden');
  userInput.placeholder = t('placeholder');
  recognition?.stop();
}

micBtn.addEventListener('click', () => {
  if (isRecording) {
    stopRecording();
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    addSystemNotice(t('noSupport'));
    return;
  }

  recognition = initSpeechRecognition();
  try {
    recognition.start();
  } catch (err) {
    console.error('Mic start error:', err);
  }
});

stopMicBtn.addEventListener('click', stopRecording);
