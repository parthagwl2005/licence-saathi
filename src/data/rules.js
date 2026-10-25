// Rules that decide whether an RTO visit is needed, and the laws behind them.
// Check the exact service list for your state on the Sarathi website before relying on this.

const o = (en, hi) => ({ en, hi });

// Laws and official decisions, newest first
export const laws = [
  {
    id: 'so4353', date: '2022-09-16',
    name: o('S.O. 4353(E): 58 services fully online', 'S.O. 4353(E): 58 सेवाएँ पूरी तरह ऑनलाइन'),
    what: o('Many licence and vehicle services can be done fully online with Aadhaar authentication, with no RTO visit. Using Aadhaar is your choice.', 'कई लाइसेंस और वाहन सेवाएँ आधार सत्यापन से पूरी तरह ऑनलाइन हो सकती हैं, RTO जाए बिना। आधार का उपयोग आपकी मर्ज़ी है।'),
    helps: o('Lost licence, renewal, address change and the learner\'s licence are usually online.', 'खोया लाइसेंस, नवीनीकरण, पता बदलना और लर्नर लाइसेंस आमतौर पर ऑनलाइन होते हैं।'),
    source: 'https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=1859976',
  },
  {
    id: 'adtc', date: '2021-07-01',
    name: o('Accredited driver training centres (GSR 394(E))', 'मान्यता प्राप्त ड्राइविंग प्रशिक्षण केंद्र (GSR 394(E))'),
    what: o('If you pass training at a government-accredited centre, you do not take the driving test at the RTO. Ordinary driving schools do not count.', 'सरकारी मान्यता प्राप्त केंद्र से प्रशिक्षण पास करने पर RTO पर ड्राइविंग टेस्ट नहीं देना होता। साधारण ड्राइविंग स्कूल इसमें नहीं आते।'),
    helps: o('The only legal way to skip the RTO driving test.', 'RTO ड्राइविंग टेस्ट छोड़ने का एकमात्र कानूनी तरीका।'),
    source: 'https://mobilityoutlook.com/news/morth-notifies-new-rules-for-accredited-driver-training-centres',
  },
  {
    id: 'clarify2024', date: '2024-05-01',
    name: o('No change from 1 June 2024', '1 जून 2024 से कोई बदलाव नहीं'),
    what: o('News said RTO driving tests would end in June 2024. The ministry clarified that nothing changed.', 'खबरों में कहा गया कि जून 2024 से RTO टेस्ट बंद होंगे। मंत्रालय ने साफ़ किया कि कुछ नहीं बदला।'),
    helps: o('Don\'t trust messages that promise a licence without a test.', 'बिना टेस्ट लाइसेंस देने वाले संदेशों पर भरोसा न करें।'),
    source: 'https://en.vikaspedia.in/viewcontent/news/clarification-regarding-accredited-driver-training-centre-and-driving-schools',
  },
  {
    id: 'digital2018', date: '2018-08-10',
    name: o('Digital licence is valid', 'डिजिटल लाइसेंस मान्य है'),
    what: o('A driving licence shown in DigiLocker or mParivahan counts the same as the card.', 'DigiLocker या mParivahan में दिखाया गया ड्राइविंग लाइसेंस कार्ड जितना ही मान्य है।'),
    helps: o('Lost your card? Your digital licence still works while the new one comes.', 'कार्ड खो गया? नया आने तक डिजिटल लाइसेंस काम करता है।'),
    source: 'https://outlookindia.com/national/digital-copies-of-driving-licence-registration-are-now-legal-news-314841',
  },
  {
    id: 'mva', date: '1988-10-14',
    name: o('Motor Vehicles Act, 1988 and Central Motor Vehicles Rules, 1989', 'मोटर वाहन अधिनियम, 1988 और केंद्रीय मोटर वाहन नियम, 1989'),
    what: o('The main law for all licences. Every rule above is built on it.', 'सभी लाइसेंस का मुख्य कानून। ऊपर के सभी नियम इसी पर आधारित हैं।'),
    helps: o('Sets ages, tests and fees.', 'उम्र, टेस्ट और शुल्क तय करता है।'),
  },
];

// Which services can usually be done without an RTO visit (sample, varies by state)
// online: true = usually fully online with Aadhaar; 'test' = one visit for the driving test
export const rtoServices = [
  { id: 'll', online: true, name: o("Learner's licence", 'लर्नर लाइसेंस'), note: o('The test can be taken from home in many states.', 'कई राज्यों में टेस्ट घर से दे सकते हैं।') },
  { id: 'duplicate', online: true, name: o('Lost or damaged licence', 'खोया या खराब लाइसेंस'), note: o('Duplicate licence, usually fully online.', 'डुप्लीकेट लाइसेंस, आमतौर पर पूरी तरह ऑनलाइन।') },
  { id: 'renew', online: true, name: o('Renew licence', 'लाइसेंस नवीनीकरण'), note: o('Online if the vehicle type stays the same.', 'वाहन प्रकार वही रहे तो ऑनलाइन।') },
  { id: 'address', online: true, name: o('Change address', 'पता बदलें'), note: o('Usually online with Aadhaar.', 'आमतौर पर आधार से ऑनलाइन।') },
  { id: 'dl', online: 'test', name: o('Driving licence', 'ड्राइविंग लाइसेंस'), note: o('One visit for the driving test, unless trained at an accredited centre.', 'ड्राइविंग टेस्ट के लिए एक बार जाना होगा, जब तक मान्यता प्राप्त केंद्र से प्रशिक्षण न हो।') },
  { id: 'add', online: 'test', name: o('Add a vehicle', 'नया वाहन जोड़ें'), note: o('One visit for the driving test of the new vehicle.', 'नए वाहन के ड्राइविंग टेस्ट के लिए एक बार।') },
];

// Questions that can turn an online service into one visit
export const rtoQuestions = [
  { id: 'aadhaar', q: o('Is your Aadhaar linked to the mobile number you use now?', 'क्या आपका आधार अभी वाले मोबाइल नंबर से जुड़ा है?'),
    no: o('Update your mobile number at an Aadhaar centre first. That visit is to the Aadhaar centre, not the RTO. Or apply without Aadhaar, which needs one RTO visit.', 'पहले आधार केंद्र पर मोबाइल नंबर अपडेट कराएँ। यह आधार केंद्र जाना है, RTO नहीं। या बिना आधार आवेदन करें, जिसमें एक बार RTO जाना होगा।') },
  { id: 'name', q: o('Is your name spelt the same on Aadhaar and your licence?', 'क्या आधार और लाइसेंस पर आपका नाम एक जैसा लिखा है?'),
    no: o('Different spellings stop online checks. Fix the spelling first (one visit), then the rest is online.', 'अलग वर्तनी से ऑनलाइन जाँच रुक जाती है। पहले वर्तनी ठीक कराएँ (एक बार जाना), फिर बाकी ऑनलाइन।') },
];

// What to bring and what happens when one visit is needed
export const oneVisit = {
  bring: [
    o('Original proof of age and address, plus one photocopy each', 'उम्र और पते के मूल प्रमाण, और हर एक की एक फ़ोटोकॉपी'),
    o('Your application number (save the summary from Home)', 'आपकी आवेदन संख्या (होम से सारांश सेव करें)'),
    o('Learner\'s licence, for a driving test', 'ड्राइविंग टेस्ट के लिए लर्नर लाइसेंस'),
    o('A vehicle with valid papers and a helmet, for a driving test', 'ड्राइविंग टेस्ट के लिए सही कागज़ों वाला वाहन और हेलमेट'),
  ],
  steps: [
    o('Go to the enquiry desk and say: "Driving licence section, please."', 'पूछताछ काउंटर पर कहें: "ड्राइविंग लाइसेंस सेक्शन, कृपया।"'),
    o('Show your application number. They check your papers.', 'अपनी आवेदन संख्या दिखाएँ। वे कागज़ जाँचेंगे।'),
    o('Photo or fingerprints may be taken.', 'फ़ोटो या उँगलियों के निशान लिए जा सकते हैं।'),
    o('For a driving test, wait for your name, then drive the track.', 'ड्राइविंग टेस्ट के लिए अपने नाम का इंतज़ार करें, फिर ट्रैक पर चलाएँ।'),
  ],
  time: o('Usually 1 to 3 hours. Go early in the morning.', 'आमतौर पर 1 से 3 घंटे। सुबह जल्दी जाएँ।'),
};

// Where people find their licence number when the card is lost
export const findNumber = [
  { id: 'digilocker', t: o('DigiLocker app', 'DigiLocker ऐप'), d: o('Open DigiLocker, sign in with Aadhaar, tap "Issued documents". Your licence and its number are there.', 'DigiLocker खोलें, आधार से साइन इन करें, "जारी दस्तावेज़" दबाएँ। वहाँ आपका लाइसेंस और नंबर है।') },
  { id: 'mparivahan', t: o('mParivahan app', 'mParivahan ऐप'), d: o('If you added your licence there before, it shows in "My RC / DL".', 'अगर पहले जोड़ा था, तो "My RC / DL" में दिखेगा।') },
  { id: 'photos', t: o('Old photos on your phone', 'फ़ोन की पुरानी फ़ोटो'), d: o('Search your gallery for a photo of the card. Many people have one.', 'गैलरी में कार्ड की फ़ोटो खोजें। ज़्यादातर लोगों के पास होती है।') },
  { id: 'sms', t: o('Old SMS', 'पुराने SMS'), d: o('Search messages for "Sarathi" or "DL". The number is often in them.', 'संदेशों में "Sarathi" या "DL" खोजें। नंबर अक्सर उनमें होता है।') },
  { id: 'papers', t: o('Old papers', 'पुराने कागज़'), d: o('Insurance papers, a challan receipt or an old application receipt may show it.', 'बीमा कागज़, चालान रसीद या पुरानी आवेदन रसीद पर हो सकता है।') },
  { id: 'rto', t: o('Still can\'t find it?', 'फिर भी नहीं मिला?'), d: o('The RTO can find it with your name and date of birth. Use "Something went wrong" to write the request.', 'RTO आपके नाम और जन्म तिथि से ढूँढ सकता है। अनुरोध लिखने के लिए "कुछ गलत हुआ" इस्तेमाल करें।'), to: '/help' },
];
