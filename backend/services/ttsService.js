const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config();

const client = new textToSpeech.TextToSpeechClient();

// Only English (India) and Tamil supported
const VOICE_MAP = {
  'English': { languageCode: 'en-IN', name: 'en-IN-Wavenet-D', ssmlGender: 'MALE' },
  'Tamil':   { languageCode: 'ta-IN', name: 'ta-IN-Wavenet-A', ssmlGender: 'FEMALE' },
  'Hindi':   { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-A', ssmlGender: 'FEMALE' }
};

const generateSpeech = async (text, languageLabel) => {
  try {
    const voice = VOICE_MAP[languageLabel] || VOICE_MAP['English'];

    const request = {
      input: { text },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
        ssmlGender: voice.ssmlGender
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95,  // Slightly slower for clarity
        pitch: 0.0
      }
    };

    const [response] = await client.synthesizeSpeech(request);
    return { audio: response.audioContent.toString('base64'), error: null };
  } catch (error) {
    console.error('TTS Error:', error.message);
    return { audio: null, error: error.message };
  }
};

module.exports = { generateSpeech };
