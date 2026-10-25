// Error dictionary: every problem in plain words, never blaming the person, with one fix.
// `complaint` is the message the app writes for the person if they need to ask for help.

const o = (en, hi) => ({ en, hi });

export const errors = {
  busy: {
    icon: 'clock',
    title: o('The government server is busy', 'सरकारी सर्वर अभी व्यस्त है'),
    what: o('Many people are using it right now. This is not your fault and nothing is lost.', 'अभी बहुत लोग इसे इस्तेमाल कर रहे हैं। यह आपकी गलती नहीं है और कुछ भी खोया नहीं।'),
    fix: o('We will keep trying on our own. You can close the app.', 'हम खुद बार-बार कोशिश करेंगे। आप ऐप बंद कर सकते हैं।'),
  },
  offline: {
    icon: 'info',
    title: o('You are offline', 'आप ऑफ़लाइन हैं'),
    what: o('There is no internet right now. Your work is saved on this phone.', 'अभी इंटरनेट नहीं है। आपका काम इस फ़ोन पर सेव है।'),
    fix: o('We will send it as soon as the internet is back.', 'इंटरनेट आते ही हम भेज देंगे।'),
  },
  payment: {
    icon: 'clock',
    title: o('Payment is pending', 'भुगतान रुका हुआ है'),
    what: o('The bank has not confirmed yet. This often clears in a few minutes.', 'बैंक ने अभी पुष्टि नहीं की है। यह अक्सर कुछ मिनटों में ठीक हो जाता है।'),
    fix: o('Do not pay again. Check your bank SMS. If money was taken and the payment failed, it usually comes back on its own.', 'दोबारा भुगतान न करें। बैंक का SMS देखें। अगर पैसे कटे और भुगतान नहीं हुआ, तो आमतौर पर अपने-आप वापस आ जाते हैं।'),
    complaint: o('I paid for application {no} but it shows payment pending. Please confirm the payment or refund it.', 'मैंने आवेदन {no} के लिए भुगतान किया, पर यह भुगतान रुका हुआ दिखा रहा है। कृपया भुगतान की पुष्टि करें या पैसे वापस करें।'),
  },
  otp: {
    icon: 'clock',
    title: o('The code did not arrive in time', 'कोड समय पर नहीं आया'),
    what: o('OTP codes stop working after a short time. That happens to everyone.', 'OTP कोड थोड़ी देर बाद काम करना बंद कर देते हैं। यह सबके साथ होता है।'),
    fix: o('Ask for a new code. If no code comes at all, your Aadhaar may be linked to an old number.', 'नया कोड मँगाएँ। अगर कोड आता ही नहीं, तो आधार किसी पुराने नंबर से जुड़ा हो सकता है।'),
  },
  unreadable: {
    icon: 'camera',
    title: o('This photo is hard to read', 'यह फ़ोटो पढ़ना मुश्किल है'),
    what: o('It may be dark, blurry or cut off.', 'यह अंधेरी, धुंधली या कटी हुई हो सकती है।'),
    fix: o('Take it again near a window, with the whole card inside the frame.', 'खिड़की के पास फिर से लें, पूरा कार्ड फ़्रेम के अंदर हो।'),
  },
  mismatch: {
    icon: 'alert',
    title: o('Your name is spelt differently', 'आपका नाम अलग लिखा है'),
    what: o('Applications are often sent back when the name does not match the ID card.', 'नाम पहचान पत्र से मेल न खाए तो आवेदन अक्सर लौटा दिए जाते हैं।'),
    fix: o('Use the name exactly as on your ID card.', 'नाम बिल्कुल पहचान पत्र जैसा लिखें।'),
  },
  loggedout: {
    icon: 'refresh',
    title: o('The official website logged you out', 'सरकारी वेबसाइट ने आपको बाहर कर दिया'),
    what: o('Government sites close after a few minutes for safety. Your details are still saved here.', 'सरकारी साइटें सुरक्षा के लिए कुछ मिनट बाद बंद हो जाती हैं। आपकी जानकारी यहाँ सेव है।'),
    fix: o('Log in again and copy from your saved details. It takes one minute.', 'फिर से लॉग इन करें और सेव जानकारी से कॉपी करें। एक मिनट लगेगा।'),
  },
  rejected: {
    icon: 'file',
    title: o('Your application was sent back', 'आपका आवेदन लौटा दिया गया'),
    what: o('This usually means one detail or document needs a change. It is fixable.', 'इसका आमतौर पर मतलब है कि एक जानकारी या दस्तावेज़ बदलना है। यह ठीक हो सकता है।'),
    fix: o('Read the reason in the SMS, fix that one thing in your details, and apply again.', 'SMS में कारण पढ़ें, अपनी जानकारी में वह एक चीज़ ठीक करें, और फिर से आवेदन करें।'),
    complaint: o('My application {no} was sent back. Please tell me exactly what to change.', 'मेरा आवेदन {no} लौटा दिया गया। कृपया बताएँ कि ठीक-ठीक क्या बदलना है।'),
  },
  nostatus: {
    icon: 'route',
    title: o('No update for many days', 'कई दिनों से कोई जानकारी नहीं'),
    what: o('Some offices take longer. Waiting is not a sign that something is wrong.', 'कुछ दफ़्तर ज़्यादा समय लेते हैं। इंतज़ार का मतलब यह नहीं कि कुछ गलत है।'),
    fix: o('If it has been more than 15 days, send a polite request. We wrote it for you.', 'अगर 15 दिन से ज़्यादा हो गए, तो विनम्र अनुरोध भेजें। हमने लिख दिया है।'),
    complaint: o('My application {no} has shown no update for more than 15 days. Please share the current status.', 'मेरे आवेदन {no} पर 15 दिन से ज़्यादा से कोई जानकारी नहीं है। कृपया वर्तमान स्थिति बताएँ।'),
  },
  findno: {
    icon: 'file',
    title: o('I cannot find my licence number', 'मुझे अपना लाइसेंस नंबर नहीं मिल रहा'),
    what: o('This is common when the card is lost.', 'कार्ड खोने पर यह आम है।'),
    fix: o('The RTO can find it from your name and date of birth. Send this request.', 'RTO आपके नाम और जन्म तिथि से ढूँढ सकता है। यह अनुरोध भेजें।'),
    complaint: o('I lost my driving licence and do not know its number. My name is {name}, date of birth {dob}. Please tell me my licence number.', 'मेरा ड्राइविंग लाइसेंस खो गया है और मुझे नंबर नहीं पता। मेरा नाम {name} है, जन्म तिथि {dob}। कृपया मेरा लाइसेंस नंबर बताएँ।'),
  },
};

// Shown on the "Something went wrong?" screen, in this order
export const helpTopics = ['busy', 'payment', 'otp', 'loggedout', 'rejected', 'nostatus', 'findno', 'unreadable'];

// Official places to ask for help
export const officialHelp = [
  { name: o('Parivahan website (help and status)', 'परिवहन वेबसाइट (मदद और स्थिति)'), url: 'https://parivahan.gov.in' },
  { name: o('Sarathi licence services', 'सारथी लाइसेंस सेवाएँ'), url: 'https://sarathi.parivahan.gov.in' },
  { name: o('Government grievance portal (CPGRAMS)', 'सरकारी शिकायत पोर्टल (CPGRAMS)'), url: 'https://pgportal.gov.in' },
];

// Scam safety tips
export const safetyTips = [
  o('We never send links to download an app. Only install apps from the Play Store or App Store.', 'हम कभी ऐप डाउनलोड करने का लिंक नहीं भेजते। केवल Play Store या App Store से ऐप लें।'),
  o('Official government websites end in .gov.in', 'सरकारी वेबसाइटें .gov.in पर खत्म होती हैं'),
  o('A message saying "your challan is pending, click here" is often a scam. Check challans only on echallan.parivahan.gov.in', '"आपका चालान बाकी है, यहाँ क्लिक करें" वाला संदेश अक्सर धोखा होता है। चालान केवल echallan.parivahan.gov.in पर देखें'),
  o('Never share an OTP with anyone who calls you, even if they say they are from the RTO.', 'कॉल करने वाले किसी को भी OTP न बताएँ, चाहे वे RTO से होने का दावा करें।'),
  o('Nobody can get you a licence without a test for extra money. That is a fraud.', 'कोई भी अतिरिक्त पैसे लेकर बिना टेस्ट लाइसेंस नहीं दिला सकता। यह धोखा है।'),
];

// What we keep and what we don't
export const privacy = [
  o('Your details and documents stay on this phone.', 'आपकी जानकारी और दस्तावेज़ इसी फ़ोन पर रहते हैं।'),
  o('ID cards are read on the phone. Nothing is uploaded.', 'पहचान पत्र फ़ोन पर ही पढ़े जाते हैं। कुछ भी अपलोड नहीं होता।'),
  o('We never keep your Aadhaar number.', 'हम आपका आधार नंबर कभी नहीं रखते।'),
  o('Nothing is sent anywhere until you tap Apply.', 'जब तक आप "आवेदन करें" नहीं दबाते, कुछ भी कहीं नहीं भेजा जाता।'),
  o('You can delete everything in Settings → Start over.', 'सेटिंग्स → फिर से शुरू करें में सब कुछ मिटा सकते हैं।'),
];
