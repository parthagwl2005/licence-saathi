// "What happened?" — common licence problems, matched from the person's own words.
// Keywords cover English, Hindi and Hinglish (Hindi typed in English letters), including common misspellings.
// route: a page in this app. link: an official site. help: a topic in Help and safety that writes the complaint.
const o = (en, hi) => ({ en, hi });

export const OFFICIAL = {
  sarathi: 'https://sarathi.parivahan.gov.in/',
  parivahan: 'https://parivahan.gov.in/',
  pg: 'https://pgportal.gov.in/',
  uidai: 'https://myaadhaar.uidai.gov.in/',
  digilocker: 'https://www.digilocker.gov.in/',
};

export const fixes = [
  {
    id: 'payment', route: '/help?topic=payment', link: 'sarathi', help: 'payment',
    k: ['payment', 'pay', 'paid', 'money', 'deducted', 'debited', 'cut', 'refund', 'receipt', 'transaction', 'upi', 'paisa', 'paise', 'pese', 'rupay', 'kat gaya', 'kat gaye', 'kaat', 'kata', 'katt', 'bhugtan', 'पैसे', 'कट', 'भुगतान', 'रसीद'],
    title: o('Money was taken but the payment shows failed or pending', 'पैसे कट गए पर भुगतान फ़ेल या रुका दिख रहा है'),
    what: o('The bank has not confirmed it to the transport site yet. This is common and usually fixes itself.', 'बैंक ने अभी ट्रांसपोर्ट साइट को पुष्टि नहीं भेजी है। यह आम है और अक्सर खुद ठीक हो जाता है।'),
    steps: [
      o('Do not pay again.', 'दोबारा भुगतान न करें।'),
      o('Wait 30 minutes, then check "Payment status" on the Sarathi site with your application number.', '30 मिनट रुकें, फिर Sarathi साइट पर आवेदन संख्या से "Payment status" देखें।'),
      o('If it failed, the money usually comes back to your account on its own within a few working days.', 'अगर फ़ेल हुआ, तो पैसे आमतौर पर कुछ कामकाजी दिनों में खुद खाते में लौट आते हैं।'),
      o('Still stuck? We will write the complaint for you.', 'फिर भी अटके हैं? हम आपके लिए शिकायत लिख देंगे।'),
    ],
  },
  {
    id: 'otp', route: '/help?topic=otp', link: 'uidai', help: 'otp',
    k: ['otp', 'code', 'sms', 'verification', 'otp nahi aaya', 'code nahi aaya', 'sms nahi aaya', 'otp not received', 'otp expired', 'ओटीपी', 'कोड'],
    title: o('The OTP or code did not come', 'OTP या कोड नहीं आया'),
    what: o('Codes can be late, or your Aadhaar may be linked to an old mobile number.', 'कोड देर से आ सकता है, या आपका आधार किसी पुराने मोबाइल नंबर से जुड़ा हो सकता है।'),
    steps: [
      o('Wait 2 minutes and tap "Resend OTP" once.', '2 मिनट रुकें और एक बार "Resend OTP" दबाएँ।'),
      o('Check that your phone has signal and SMS inbox space.', 'देखें कि फ़ोन में नेटवर्क है और SMS के लिए जगह है।'),
      o('If it never comes, check which number is linked to your Aadhaar on the UIDAI site.', 'अगर कभी नहीं आता, तो UIDAI साइट पर देखें कि आधार से कौन सा नंबर जुड़ा है।'),
    ],
  },
  {
    id: 'busy', route: '/help?topic=busy', link: 'parivahan', help: 'busy',
    k: ['server', 'site', 'website', 'portal', 'down', 'not opening', 'not working', 'loading', 'slow', 'error', 'busy', 'crash', 'khul nahi', 'khul nhi', 'nahi khul', 'chal nahi', 'band', 'atak', 'hang', 'सर्वर', 'साइट', 'वेबसाइट', 'नहीं खुल', 'अटक'],
    title: o('The government website is not opening or is very slow', 'सरकारी वेबसाइट नहीं खुल रही या बहुत धीमी है'),
    what: o('Many people use it at the same time. It is not your fault and your details are safe here.', 'एक साथ बहुत लोग इसे इस्तेमाल करते हैं। यह आपकी गलती नहीं है और आपकी जानकारी यहाँ सुरक्षित है।'),
    steps: [
      o('Try early morning or late evening, when fewer people are online.', 'सुबह जल्दी या देर शाम कोशिश करें, जब कम लोग ऑनलाइन होते हैं।'),
      o('In this app, your application waits and sends itself when the server is free.', 'इस ऐप में आपका आवेदन इंतज़ार करता है और सर्वर खाली होते ही खुद चला जाता है।'),
    ],
  },
  {
    id: 'loggedout', route: '/help?topic=loggedout', link: 'sarathi', help: 'loggedout',
    k: ['logout', 'logged out', 'log out', 'logout kar', 'logout ho', 'session', 'timeout', 'time out', 'kicked', 'bahar', 'nikal diya', 'login again', 'लॉगआउट', 'बाहर कर'],
    title: o('The website logged me out in the middle', 'वेबसाइट ने बीच में बाहर कर दिया'),
    what: o('Government sites close after a few minutes for safety. Nothing you filled here is lost.', 'सरकारी साइटें सुरक्षा के लिए कुछ मिनट बाद बंद हो जाती हैं। यहाँ भरी जानकारी नहीं खोई।'),
    steps: [
      o('Log in again.', 'फिर से लॉग इन करें।'),
      o('Copy your details from "Your details" in this app; it takes one minute.', 'इस ऐप में "आपकी जानकारी" से कॉपी करें; एक मिनट लगेगा।'),
    ],
  },
  {
    id: 'rejected', route: '/help?topic=rejected', link: 'sarathi', help: 'rejected',
    k: ['rejected', 'reject', 'sent back', 'returned', 'objection', 'disapproved', 'cancelled', 'wapas', 'vapas', 'lauta', 'radd', 'रद्द', 'वापस', 'लौटा'],
    title: o('My application was rejected or sent back', 'मेरा आवेदन रद्द हो गया या लौटा दिया गया'),
    what: o('Usually one detail or document needs a change. It is fixable.', 'आमतौर पर एक जानकारी या दस्तावेज़ बदलना होता है। यह ठीक हो सकता है।'),
    steps: [
      o('Read the reason in the SMS or on the status page.', 'SMS या स्टेटस पेज पर कारण पढ़ें।'),
      o('The most common reasons: name not matching the ID, an unclear photo, or a wrong document.', 'सबसे आम कारण: नाम पहचान पत्र से मेल न खाना, धुंधली फ़ोटो, या गलत दस्तावेज़।'),
      o('Fix that one thing and apply again. We can write a polite request if the reason is not clear.', 'वह एक चीज़ ठीक करें और फिर आवेदन करें। कारण साफ़ न हो तो हम विनम्र अनुरोध लिख देंगे।'),
    ],
  },
  {
    id: 'nostatus', route: '/track', link: 'sarathi', help: 'nostatus',
    k: ['status', 'update', 'pending', 'waiting', 'no update', 'how long', 'when will', 'kab aayega', 'kab ayega', 'kab milega', 'abhi tak', 'intezar', 'track', 'स्टेटस', 'कब आएगा', 'कब मिलेगा', 'अभी तक'],
    title: o('No update on my application', 'मेरे आवेदन पर कोई जानकारी नहीं'),
    what: o('Some offices take longer. Waiting is not a sign that something is wrong.', 'कुछ दफ़्तर ज़्यादा समय लेते हैं। इंतज़ार का मतलब यह नहीं कि कुछ गलत है।'),
    steps: [
      o('Check the status with your application number.', 'आवेदन संख्या से स्टेटस देखें।'),
      o('If nothing has changed for more than 15 days, send a polite request. We write it for you.', 'अगर 15 दिन से ज़्यादा कुछ नहीं बदला, तो विनम्र अनुरोध भेजें। हम लिख देते हैं।'),
    ],
  },
  {
    id: 'lost', route: '/lost', link: 'digilocker',
    k: ['lost', 'lose', 'missing', 'stolen', 'theft', 'kho gaya', 'kho gya', 'kho diya', 'gum', 'gum ho', 'chori', 'chori ho', 'damaged', 'torn', 'phat', 'खो', 'गुम', 'चोरी', 'फट'],
    title: o('I lost my driving licence (or it was stolen or damaged)', 'मेरा ड्राइविंग लाइसेंस खो गया (या चोरी या खराब हो गया)'),
    what: o('You can still drive: the licence in DigiLocker or mParivahan counts like the card.', 'आप अब भी गाड़ी चला सकते हैं: DigiLocker या mParivahan में लाइसेंस कार्ड जैसा ही मान्य है।'),
    steps: [
      o('Open your licence in DigiLocker or mParivahan to keep driving legally.', 'कानूनी रूप से गाड़ी चलाते रहने के लिए DigiLocker या mParivahan में लाइसेंस खोलें।'),
      o('If it was stolen, file a police report first (most states allow it online).', 'अगर चोरी हुआ, तो पहले पुलिस रिपोर्ट करें (ज़्यादातर राज्यों में ऑनलाइन होती है)।'),
      o('Apply for a duplicate licence. Usually no RTO visit is needed.', 'डुप्लिकेट लाइसेंस के लिए आवेदन करें। आमतौर पर RTO जाने की ज़रूरत नहीं।'),
    ],
  },
  {
    id: 'findno', route: '/help?topic=findno', link: 'digilocker', help: 'findno',
    k: ['licence number', 'license number', 'dl number', 'dl no', 'number yaad', 'number nahi pata', 'number bhool', 'forgot number', "don't know number", 'number nahi mil', 'नंबर याद', 'नंबर नहीं पता', 'नंबर भूल'],
    title: o('I don\'t know my licence number', 'मुझे अपना लाइसेंस नंबर नहीं पता'),
    what: o('Very common after a card is lost. There are three easy places to find it.', 'कार्ड खोने के बाद यह बहुत आम है। इसे ढूँढने की तीन आसान जगहें हैं।'),
    steps: [
      o('DigiLocker: "Issued documents" shows your licence and its number.', 'DigiLocker: "Issued documents" में लाइसेंस और उसका नंबर दिखता है।'),
      o('Search your phone gallery for an old photo of the card.', 'फ़ोन की गैलरी में कार्ड की पुरानी फ़ोटो ढूँढें।'),
      o('Or the RTO can find it from your name and date of birth. We write the request for you.', 'या RTO आपके नाम और जन्म तिथि से ढूँढ सकता है। हम अनुरोध लिख देते हैं।'),
    ],
  },
  {
    id: 'photo', route: '/profile', link: 'sarathi', help: 'unreadable',
    k: ['photo', 'picture', 'image', 'upload', 'signature', 'size', 'kb', 'too large', 'too big', 'file', 'scan', 'blurry', 'not uploading', 'upload nahi', 'photo nahi', 'फ़ोटो', 'फोटो', 'अपलोड', 'हस्ताक्षर', 'साइज़'],
    title: o('My photo, signature or document won\'t upload', 'फ़ोटो, हस्ताक्षर या दस्तावेज़ अपलोड नहीं हो रहा'),
    what: o('Usually the file is too big, or the photo is dark or blurry.', 'आमतौर पर फ़ाइल बहुत बड़ी होती है, या फ़ोटो अंधेरी या धुंधली होती है।'),
    steps: [
      o('Add it in this app: it checks the size and shrinks it with one tap ("Make it fit").', 'इस ऐप में जोड़ें: यह साइज़ जाँचता है और एक टैप में छोटा कर देता है ("ठीक करें")।'),
      o('Take photos near a window, with the whole card inside the frame.', 'खिड़की के पास फ़ोटो लें, पूरा कार्ड फ़्रेम के अंदर हो।'),
    ],
  },
  {
    id: 'name', route: '/profile', link: 'sarathi',
    k: ['name wrong', 'wrong name', 'spelling', 'name galat', 'naam galat', 'naam', 'galat naam', 'spelling mistake', 'name mismatch', 'name different', 'नाम गलत', 'नाम', 'स्पेलिंग'],
    title: o('My name is wrong or spelt differently', 'मेरा नाम गलत है या अलग लिखा है'),
    what: o('Applications are often sent back when the name does not match the ID card exactly.', 'नाम पहचान पत्र से बिल्कुल मेल न खाए तो आवेदन अक्सर लौट जाते हैं।'),
    steps: [
      o('Use your name exactly as on your Aadhaar or ID card. This app warns you before you pay.', 'नाम बिल्कुल आधार या पहचान पत्र जैसा लिखें। यह ऐप भुगतान से पहले चेतावनी देता है।'),
      o('If the licence itself has a wrong name, apply for a correction on the Sarathi site with your ID as proof.', 'अगर लाइसेंस पर ही नाम गलत है, तो पहचान पत्र को सबूत के रूप में लगाकर Sarathi साइट पर सुधार के लिए आवेदन करें।'),
    ],
  },
  {
    id: 'address', route: '/service/address', link: 'sarathi',
    k: ['address', 'shifted', 'moved', 'new house', 'new city', 'pata', 'pata badal', 'ghar badal', 'shift', 'पता', 'पता बदल', 'घर बदल'],
    title: o('I moved and need to change the address', 'मैंने घर बदला है और पता बदलना है'),
    what: o('You can change the address on your licence, usually fully online.', 'आप लाइसेंस पर पता बदल सकते हैं, अक्सर पूरी तरह ऑनलाइन।'),
    steps: [
      o('Keep proof of the new address ready (Aadhaar, electricity bill or rent agreement).', 'नए पते का प्रमाण तैयार रखें (आधार, बिजली का बिल या किराया अनुबंध)।'),
      o('Apply for "Change of address". This app fills your details for you.', '"पता बदलें" के लिए आवेदन करें। यह ऐप आपकी जानकारी भर देता है।'),
    ],
  },
  {
    id: 'renew', route: '/service/renew', link: 'sarathi',
    k: ['renew', 'renewal', 'expired', 'expire', 'expiry', 'validity', 'khatam', 'purana', 'old licence', 'expire ho', 'रिन्यू', 'खत्म', 'समाप्त', 'वैधता'],
    title: o('My licence has expired or is about to', 'मेरा लाइसेंस खत्म हो गया है या होने वाला है'),
    what: o('Renewal is usually online. At 40 or older you also need a doctor\'s certificate (Form 1A).', 'रिन्यू आमतौर पर ऑनलाइन होता है। 40 या ज़्यादा उम्र में डॉक्टर का प्रमाणपत्र (फ़ॉर्म 1A) भी चाहिए।'),
    steps: [
      o('Apply for renewal. Do it before or soon after the expiry date.', 'रिन्यू के लिए आवेदन करें। समाप्ति तिथि से पहले या उसके तुरंत बाद करें।'),
      o('Keep your licence number ready; this app fills the rest.', 'लाइसेंस नंबर तैयार रखें; बाकी यह ऐप भर देता है।'),
    ],
  },
  {
    id: 'slot', route: '/permanent', link: 'sarathi',
    k: ['slot', 'appointment', 'booking', 'date', 'no slot', 'slot nahi', 'date nahi', 'test date', 'driving test date', 'स्लॉट', 'तारीख', 'अपॉइंटमेंट'],
    title: o('I can\'t get a driving test slot', 'ड्राइविंग टेस्ट का स्लॉट नहीं मिल रहा'),
    what: o('Slots fill up fast. New slots usually open daily, often early in the morning.', 'स्लॉट जल्दी भर जाते हैं। नए स्लॉट आमतौर पर रोज़ खुलते हैं, अक्सर सुबह जल्दी।'),
    steps: [
      o('Check again early in the morning.', 'सुबह जल्दी फिर देखें।'),
      o('Try a nearby RTO in your state if allowed.', 'अगर अनुमति हो, तो अपने राज्य के पास वाले RTO में कोशिश करें।'),
      o('Make sure your learner\'s licence is still valid on that date.', 'पक्का करें कि उस तारीख तक आपका लर्नर लाइसेंस मान्य रहेगा।'),
    ],
  },
  {
    id: 'failed', route: '/mock', link: 'sarathi',
    k: ['fail', 'failed', 'not passed', 'did not pass', 'fail ho', 'fail hogaya', 'pass nahi', 'reject test', 'फ़ेल', 'फेल', 'पास नहीं'],
    title: o('I failed the test', 'मैं टेस्ट में फ़ेल हो गया'),
    what: o('It happens to many people. You can take the test again.', 'बहुत लोगों के साथ होता है। आप फिर से टेस्ट दे सकते हैं।'),
    steps: [
      o('Learner\'s test: practise with the mock test until the ready meter is green, then book again.', 'लर्नर टेस्ट: मॉक टेस्ट से तब तक अभ्यास करें जब तक रेडी मीटर हरा न हो, फिर दोबारा बुक करें।'),
      o('Driving test: you can usually try again after 7 days. Practise the parts that went wrong.', 'ड्राइविंग टेस्ट: आमतौर पर 7 दिन बाद फिर दे सकते हैं। जो हिस्सा गलत हुआ, उसका अभ्यास करें।'),
    ],
  },
  {
    id: 'card', route: '/track', link: 'digilocker',
    k: ['card', 'card not received', 'not delivered', 'post', 'speed post', 'courier', 'delivery', 'card nahi aaya', 'card nahi mila', 'licence nahi aaya', 'dak', 'कार्ड', 'डाक'],
    title: o('My licence card has not arrived', 'मेरा लाइसेंस कार्ड नहीं आया'),
    what: o('The card comes by post and can take a few weeks. You can drive with the DigiLocker copy meanwhile.', 'कार्ड डाक से आता है और कुछ हफ़्ते लग सकते हैं। तब तक DigiLocker वाली कॉपी से गाड़ी चला सकते हैं।'),
    steps: [
      o('Check the status: it shows when the card was printed and posted.', 'स्टेटस देखें: इसमें कार्ड कब छपा और कब भेजा गया, दिखता है।'),
      o('If it was posted long ago, ask the RTO; returned cards are kept there.', 'अगर बहुत पहले भेजा गया था, तो RTO से पूछें; लौटे कार्ड वहीं रखे जाते हैं।'),
    ],
  },
  {
    id: 'rto', route: '/rto-check', link: 'parivahan',
    k: ['rto', 'office', 'visit', 'go to rto', 'jana padega', 'jaana', 'jana hai', 'need to go', 'आरटीओ', 'जाना पड़ेगा', 'दफ़्तर'],
    title: o('Do I have to go to the RTO?', 'क्या मुझे RTO जाना पड़ेगा?'),
    what: o('Many licence services are fully online with Aadhaar since 2022. Some steps still need one visit.', '2022 से कई लाइसेंस सेवाएँ आधार से पूरी तरह ऑनलाइन हैं। कुछ कामों के लिए एक बार जाना पड़ता है।'),
    steps: [
      o('Answer three quick questions to find out for your case.', 'अपने मामले के लिए तीन छोटे सवालों के जवाब दें।'),
    ],
  },
];

export const fixById = Object.fromEntries(fixes.map((f) => [f.id, f]));

// ---------- Matching that forgives spelling: Hinglish variants are folded, and words 1–2 letters off still match
const FOLD = [
  [/\bnhi\b|\bnai\b|\bnahin\b|\bnahee\b|\bnahi\b|\bni\b/g, 'nahi'],
  [/\baya\b|\baaya\b|\baayaa\b|\baia\b/g, 'aaya'],
  [/\bgya\b|\bgaya\b|\bgyaa\b/g, 'gaya'],
  [/\bpaisa\b|\bpaise\b|\bpese\b|\bpaisay\b/g, 'paise'],
  [/\blicense\b|\blicence\b|\blicnse\b|\blisence\b|\blaisens\b/g, 'licence'],
  [/\bpaymant\b|\bpayement\b|\bpaymnt\b/g, 'payment'],
  [/\bwebsit\b|\bwebsite\b|\bwebside\b/g, 'website'],
];
export function normalize(text) {
  let s = ' ' + String(text || '').toLowerCase().replace(/[?!.,;:"'()]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  FOLD.forEach(([re, to]) => { s = s.replace(re, to); });
  return s;
}
function near(a, b) {
  if (Math.abs(a.length - b.length) > 2) return false;
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  const d = m[a.length][b.length];
  return b.length >= 7 ? d <= 2 : b.length >= 4 ? d <= 1 : false;
}

// Returns the best matches, best first: [{ id, score }]
export function matchFixes(text, max = 3) {
  const q = normalize(text);
  const words = q.trim().split(' ').filter(Boolean);
  const scored = fixes.map((f) => {
    let score = 0;
    for (const raw of f.k) {
      const k = normalize(raw).trim();
      if (!k) continue;
      if (/^[a-z0-9 ']+$/.test(k)) {
        if (q.includes(' ' + k + ' ')) score += k.includes(' ') ? 6 : Math.min(k.length, 5);
        else if (!k.includes(' ') && k.length >= 4 && words.some((w) => near(w, k))) score += 3;
      } else if (q.includes(k)) score += Math.min(k.length, 5) + 1;
    }
    return { id: f.id, score };
  });
  return scored.filter((x) => x.score >= 3).sort((a, b) => b.score - a.score).slice(0, max);
}
