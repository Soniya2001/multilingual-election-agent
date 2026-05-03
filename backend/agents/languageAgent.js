const translations = {
  "Tamil": {
    "Registering to vote is easy!": "வாக்களிக்கப் பதிவு செய்வது எளிது!",
    "You will need the following documents for registration:": "பதிவு செய்ய உங்களுக்கு பின்வரும் ஆவணங்கள் தேவைப்படும்:",
    "Here are the eligibility criteria to vote:": "வாக்களிக்க தகுதிக்கான அளவுகோல்கள் இங்கே:",
    "Keep track of these important dates:": "இந்த முக்கியமான தேதிகளைக் கண்காணித்து வாருங்கள்:",
    "I can help you with registration, documents, eligibility, and election timelines. What would you like to know?": "பதிவு, ஆவணங்கள், தகுதி மற்றும் தேர்தல் காலக்கெடு ஆகியவற்றுக்கு நான் உங்களுக்கு உதவ முடியும். நீங்கள் என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?",
    "Step": "படி",
    "Must be a citizen of India.": "இந்தியக் குடிமகனாக இருக்க வேண்டும்.",
    "Must be 18 years or older on the qualifying date.": "தகுதி தேதியன்று 18 வயது அல்லது அதற்கு மேற்பட்டவராக இருக்க வேண்டும்.",
    "Must be a resident of the polling area where registration is sought.": "பதிவு கோரப்படும் வாக்குச் சாவடிப் பகுதியின் குடியிருப்பாளராக இருக்க வேண்டும்.",
    "Must not be disqualified from registration.": "பதிவு செய்யத் தகுதியற்றவராக இருக்கக்கூடாது.",
    "Passport size photograph": "பாஸ்போர்ட் அளவு புகைப்படம்",
    "Age proof (Birth Certificate, Aadhaar Card, PAN Card, etc.)": "வயதுச் சான்று (பிறப்புச் சான்றிதழ், ஆதார் அட்டை, பான் கார்டு போன்றவை)",
    "Address proof (Utility bills, Aadhaar Card, Passport, etc.)": "முகவரிச் சான்று (மின்சாரக் கட்டண ரசீதுகள், ஆதார் அட்டை, பாஸ்போர்ட் போன்றவை)",
    "Visit the official Election Commission of India (ECI) portal: voterportal.eci.gov.in": "இந்திய தேர்தல் ஆணையத்தின் (ECI) அதிகாரப்பூர்வ போர்ட்டலைப் பார்வையிடவும்: voterportal.eci.gov.in",
    "Fill out Form 6 for new registration.": "புதிய பதிவிற்கு படிவம் 6-ஐ நிரப்பவும்.",
    "Upload required documents (ID, address proof, photo).": "தேவையான ஆவணங்களை (அடையாளச் சான்று, முகவரிச் சான்று, புகைப்படம்) பதிவேற்றவும்.",
    "Submit the application and track the status using the reference ID.": "விண்ணப்பத்தைச் சமர்ப்பித்து, குறிப்பு ஐடியைப் பயன்படுத்தி நிலையைத் தெரிந்து கொள்ளவும்."
  },
  "Hindi": {
    "Registering to vote is easy!": "वोट देने के लिए पंजीकरण करना आसान है!",
    "You will need the following documents for registration:": "पंजीकरण के लिए आपको निम्नलिखित दस्तावेजों की आवश्यकता होगी:",
    "Here are the eligibility criteria to vote:": "वोट देने के लिए पात्रता मानदंड यहां दिए गए हैं:",
    "Keep track of these important dates:": "इन महत्वपूर्ण तिथियों पर नज़र रखें:",
    "I can help you with registration, documents, eligibility, and election timelines. What would you like to know?": "मैं पंजीकरण, दस्तावेजों, पात्रता और चुनाव समयसीमा में आपकी सहायता कर सकता हूं। आप क्या जानना चाहेंगे?",
    "Step": "चरण"
  }
};

const translate = (response, targetLanguage) => {
  if (targetLanguage === "English" || !translations[targetLanguage]) {
    return response;
  }

  const langData = translations[targetLanguage];
  let translatedText = langData[response.text] || response.text;
  
  let translatedSteps = response.steps.map(step => {
    let s = step;
    // If it has the format "Step X → Content", translate both parts
    if (s.includes(" → ")) {
      const [prefix, content] = s.split(" → ");
      const translatedPrefix = prefix.replace("Step", langData["Step"] || "Step");
      const translatedContent = langData[content] || content;
      return `${translatedPrefix} → ${translatedContent}`;
    }
    // Otherwise try to translate the whole string
    return langData[s] || s;
  });

  return {
    ...response,
    text: translatedText,
    steps: translatedSteps
  };
};

module.exports = { translate };
