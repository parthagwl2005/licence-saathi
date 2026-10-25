// Learning and guidance content: glossary, documents, common mistakes, rule lessons,
// driving test and test-day guidance. Edit text here without touching any screen.

const o = (en, hi) => ({ en, hi });

// One-line meanings for jargon. Shown when someone taps a dotted-underlined term.
export const glossary = {
  RTO: o('Regional Transport Office: the government office that issues licences.', 'क्षेत्रीय परिवहन कार्यालय: लाइसेंस देने वाला सरकारी दफ़्तर।'),
  LL: o("Learner's licence: a temporary licence to practise with an \"L\" sign.", 'लर्नर लाइसेंस: "L" निशान लगाकर अभ्यास करने का अस्थायी लाइसेंस।'),
  DL: o('Driving licence: your permanent, full licence.', 'ड्राइविंग लाइसेंस: आपका स्थायी, पूरा लाइसेंस।'),
  'Form 1': o('A form where you declare yourself that you are fit to drive.', 'एक फ़ॉर्म जिसमें आप खुद घोषणा करते हैं कि आप चलाने के लिए फ़िट हैं।'),
  'Form 1A': o('A medical certificate from a registered doctor (40+ age).', 'पंजीकृत डॉक्टर का मेडिकल प्रमाणपत्र (40+ उम्र के लिए)।'),
  Sarathi: o('Sarathi Parivahan: the official website for licence services.', 'सारथी परिवहन: लाइसेंस सेवाओं की सरकारी वेबसाइट।'),
  RC: o('Registration Certificate: proves a vehicle is registered.', 'पंजीकरण प्रमाणपत्र: वाहन के पंजीकरण का प्रमाण।'),
  PUC: o('Pollution Under Control certificate for your vehicle.', 'वाहन का प्रदूषण नियंत्रण प्रमाणपत्र।'),
  MCWG: o('Motorcycle with gear: the licence class for motorcycles.', 'गियर वाली मोटरसाइकिल: मोटरसाइकिल की लाइसेंस श्रेणी।'),
  LMV: o('Light Motor Vehicle: the licence class for cars.', 'हल्का मोटर वाहन: कार की लाइसेंस श्रेणी।'),
};

// Documents checklist. `when`: 'always' | 'over40' | 'parent'
export const documents = [
  { id: 'age', when: 'always', name: o('Proof of age', 'उम्र का प्रमाण'), what: o('A paper that shows your date of birth.', 'ऐसा कागज़ जिसमें आपकी जन्म तिथि लिखी हो।'), examples: [o('Birth certificate', 'जन्म प्रमाणपत्र'), o('Class 10 marksheet', '10वीं की मार्कशीट'), o('Passport or PAN card', 'पासपोर्ट या पैन कार्ड')] },
  { id: 'address', when: 'always', name: o('Proof of address', 'पते का प्रमाण'), what: o('A paper that shows where you live now.', 'ऐसा कागज़ जिसमें आपका अभी का पता हो।'), examples: [o('Aadhaar card', 'आधार कार्ड'), o('Electricity or water bill', 'बिजली या पानी का बिल'), o('Rent agreement', 'किराया अनुबंध')] },
  { id: 'photo', when: 'always', name: o('Passport-size photo', 'पासपोर्ट साइज़ फ़ोटो'), what: o('A recent, clear photo of your face on a plain light background.', 'हल्के सादे पीछे वाली, आपके चेहरे की हाल की साफ़ फ़ोटो।'), examples: [o('Phone photo against a white wall', 'सफ़ेद दीवार के सामने फ़ोन से खींची फ़ोटो'), o('Studio passport photo, scanned', 'स्टूडियो की पासपोर्ट फ़ोटो, स्कैन की हुई')] },
  { id: 'signature', when: 'always', name: o('Your signature', 'आपके हस्ताक्षर'), what: o('Sign on white paper with a dark pen, then take a photo.', 'सफ़ेद कागज़ पर गहरे पेन से हस्ताक्षर करें, फिर फ़ोटो लें।'), examples: [o('Black or blue pen on plain white paper', 'सादे सफ़ेद कागज़ पर काला या नीला पेन'), o('Same signature as on your other IDs', 'वही हस्ताक्षर जो दूसरे पहचान पत्रों पर हैं')] },
  { id: 'form1', when: 'always', name: o('Self-declaration of fitness (Form 1)', 'स्वास्थ्य स्व-घोषणा (फ़ॉर्म 1)'), what: o('You answer a few yes/no health questions yourself. It is part of the online form.', 'आप खुद कुछ हाँ/नहीं स्वास्थ्य सवालों के जवाब देते हैं। यह ऑनलाइन फ़ॉर्म का हिस्सा है।'), examples: [o('Filled inside the application', 'आवेदन के अंदर ही भरा जाता है'), o('No doctor needed', 'डॉक्टर की ज़रूरत नहीं')] },
  { id: 'form1a', when: 'over40', name: o("Doctor's certificate (Form 1A)", 'डॉक्टर का प्रमाणपत्र (फ़ॉर्म 1A)'), what: o('Needed because you are 40 or older. A registered doctor checks you and signs it.', 'क्योंकि आपकी उम्र 40 या ज़्यादा है। पंजीकृत डॉक्टर जाँच करके हस्ताक्षर करता है।'), examples: [o('Government hospital doctor', 'सरकारी अस्पताल के डॉक्टर'), o('Any registered (MBBS) doctor', 'कोई भी पंजीकृत (MBBS) डॉक्टर')] },
  { id: 'consent', when: 'parent', name: o("Parent's consent", 'माता-पिता की सहमति'), what: o('Under 18 for a 50cc scooter, a parent or guardian must agree in writing.', '18 से कम उम्र में 50cc स्कूटर के लिए माता-पिता या अभिभावक की लिखित सहमति।'), examples: [o('Signed consent form from a parent', 'माता-पिता का हस्ताक्षरित सहमति फ़ॉर्म'), o("Parent's ID proof", 'माता-पिता का पहचान प्रमाण')] },
];

// "People often get stuck here" boxes, keyed by place in the app.
export const stuck = {
  eligibility: [o('Choosing a car when you want a bike licence. Pick the vehicle you will actually drive.', 'बाइक लाइसेंस चाहिए पर कार चुन लेना। वही वाहन चुनें जो आप चलाएँगे।'), o('Applying a few days before turning 18. Wait until your birthday.', '18 साल पूरे होने से कुछ दिन पहले आवेदन करना। जन्मदिन तक रुकें।')],
  documents: [o('The name is spelt differently on two documents.', 'दो दस्तावेज़ों पर नाम अलग-अलग लिखा होना।'), o('The address proof shows an old address.', 'पते के प्रमाण में पुराना पता होना।'), o('A blurry photo of the document.', 'दस्तावेज़ की धुंधली फ़ोटो।')],
  name: [o('Writing a nickname instead of your full name.', 'पूरे नाम की जगह घर का नाम लिखना।'), o('Spelling that does not match your Aadhaar or marksheet.', 'वर्तनी जो आधार या मार्कशीट से मेल न खाए।')],
  dob: [o('Swapping the day and month.', 'दिन और महीने को उलट देना।')],
  photo: [o('Photo file too big. We can shrink it for you.', 'फ़ोटो फ़ाइल बहुत बड़ी होना। हम इसे छोटा कर सकते हैं।'), o('Dark background, cap or sunglasses.', 'गहरा पीछे का हिस्सा, टोपी या धूप का चश्मा।')],
  vehicle: [o('Forgetting to add a second vehicle type you need. Each type is charged separately.', 'दूसरे ज़रूरी वाहन प्रकार को जोड़ना भूल जाना। हर प्रकार का शुल्क अलग है।')],
  test: [o('Rushing. You have 30 seconds; read all options first.', 'जल्दबाज़ी। आपके पास 30 सेकंड हैं; पहले सारे विकल्प पढ़ें।'), o('Mixing up "no parking" and "parking" signs.', '"पार्किंग निषेध" और "पार्किंग" संकेतों में उलझना।')],
  testDay: [o('Poor light or a noisy room during the online test.', 'ऑनलाइन टेस्ट के समय कम रोशनी या शोर वाला कमरा।'), o('Looking away from the screen too often.', 'बार-बार स्क्रीन से नज़र हटाना।'), o('Low phone battery or weak internet.', 'फ़ोन की कम बैटरी या कमज़ोर इंटरनेट।')],
  permanent: [o('Applying before 30 days have passed.', '30 दिन पूरे होने से पहले आवेदन करना।'), o('Letting the learner\'s licence expire before the driving test.', 'ड्राइविंग टेस्ट से पहले लर्नर लाइसेंस को खत्म होने देना।'), o('Bringing a vehicle without valid papers.', 'बिना सही कागज़ों वाला वाहन लाना।')],
  track: [o('Typing the application number with a missing dash or digit.', 'आवेदन संख्या में डैश या अंक छूट जाना।')],
};

// Rules of the road lessons. `illus` refers to drawings in src/components/Illus.jsx
export const ruleLessons = [
  { id: 'keep-left', illus: 'keepLeft', title: o('Keep left', 'बाईं ओर चलें'), text: o('In India, always drive on the left side of the road.', 'भारत में हमेशा सड़क के बाईं ओर वाहन चलाएँ।') },
  { id: 'overtake', illus: 'overtake', title: o('Overtake from the right', 'दाईं ओर से ओवरटेक करें'), text: o('Pass another vehicle only from its right, and only when the road ahead is clear.', 'दूसरे वाहन से आगे केवल उसकी दाईं ओर से निकलें, और तभी जब आगे सड़क साफ़ हो।') },
  { id: 'helmet', illus: 'helmet', title: o('Helmet, every ride', 'हर बार हेलमेट'), text: o('Rider and pillion both wear a helmet with the strap fastened.', 'चालक और पीछे बैठा व्यक्ति, दोनों पट्टा बाँधकर हेलमेट पहनें।') },
  { id: 'seatbelt', illus: 'seatbelt', title: o('Seatbelt for everyone', 'सबके लिए सीटबेल्ट'), text: o('In a car, the driver and every passenger wears a seatbelt.', 'कार में चालक और हर यात्री सीटबेल्ट पहने।') },
  { id: 'phone', illus: 'phone', title: o('No phone while driving', 'चलाते समय फ़ोन नहीं'), text: o('Do not call or text while driving. Stop safely first.', 'चलाते समय कॉल या मैसेज न करें। पहले सुरक्षित जगह रुकें।') },
  { id: 'signal', illus: 'signal', title: o('Red means stop', 'लाल मतलब रुकें'), text: o('Stop before the line at red. Yellow means get ready to stop.', 'लाल पर लाइन से पहले रुकें। पीला मतलब रुकने की तैयारी।') },
  { id: 'ambulance', illus: 'ambulance', title: o('Make way for ambulances', 'एम्बुलेंस को रास्ता दें'), text: o('Hear a siren? Move to the left and let it pass.', 'सायरन सुनें तो बाईं ओर हटें और उसे जाने दें।') },
  { id: 'zebra', illus: 'zebra', title: o('People first at zebra crossings', 'ज़ेबरा क्रॉसिंग पर पहले पैदल यात्री'), text: o('Stop and let people cross. Never honk at them.', 'रुकें और लोगों को पार करने दें। उन पर हॉर्न न बजाएँ।') },
  { id: 'quiet', illus: 'quiet', title: o('Quiet near hospitals and schools', 'अस्पताल और स्कूल के पास शांति'), text: o('No horn near hospitals and schools. Go slowly.', 'अस्पताल और स्कूल के पास हॉर्न नहीं। धीरे चलें।') },
];

// Driving test guide
export const drivingTest = {
  twoWheeler: [
    { illus: 'checkIn', t: o('Check in at the RTO', 'RTO पर हाज़िरी दें'), d: o('Show your learner\'s licence and slot booking.', 'लर्नर लाइसेंस और स्लॉट बुकिंग दिखाएँ।') },
    { illus: 'helmet', t: o('Helmet on, vehicle ready', 'हेलमेट पहनें, वाहन तैयार'), d: o('Fasten the strap. Check mirrors and indicators work.', 'पट्टा बाँधें। शीशे और इंडिकेटर जाँच लें।') },
    { illus: 'track8', t: o('Ride the figure-8 track', '8 आकार के ट्रैक पर चलाएँ'), d: o('Ride slowly without putting your feet down or touching the lines.', 'धीरे चलाएँ, पैर ज़मीन पर न रखें और लाइनों को न छुएँ।') },
    { illus: 'road', t: o('Short road ride', 'छोटी सड़क ड्राइव'), d: o('Use indicators, keep left and stop at signals.', 'इंडिकेटर दें, बाईं ओर चलें और सिग्नल पर रुकें।') },
  ],
  car: [
    { illus: 'checkIn', t: o('Check in at the RTO', 'RTO पर हाज़िरी दें'), d: o('Show your learner\'s licence and slot booking.', 'लर्नर लाइसेंस और स्लॉट बुकिंग दिखाएँ।') },
    { illus: 'seatbelt', t: o('Seatbelt and mirrors', 'सीटबेल्ट और शीशे'), d: o('Adjust the seat and mirrors, then fasten your seatbelt.', 'सीट और शीशे ठीक करें, फिर सीटबेल्ट बाँधें।') },
    { illus: 'trackH', t: o('H-track or parking test', 'H-ट्रैक या पार्किंग टेस्ट'), d: o('Drive forward and reverse through the track without touching the poles.', 'खंभों को छुए बिना ट्रैक में आगे और पीछे चलाएँ।') },
    { illus: 'road', t: o('Short road drive', 'छोटी सड़क ड्राइव'), d: o('Use indicators, check mirrors and follow signs.', 'इंडिकेटर दें, शीशे देखें और संकेतों का पालन करें।') },
  ],
  failReasons: [
    { t: o('Putting a foot down on the track', 'ट्रैक पर पैर रखना'), fix: o('Practise slow riding on an empty ground. Use the rear brake gently.', 'खाली मैदान में धीमी सवारी का अभ्यास करें। पिछला ब्रेक आराम से लगाएँ।') },
    { t: o('Forgetting indicators', 'इंडिकेटर भूल जाना'), fix: o('Say it in your head: mirror, signal, turn.', 'मन में दोहराएँ: शीशा, संकेत, मोड़।') },
    { t: o('Touching lines or poles', 'लाइन या खंभे छूना'), fix: o('Go slower. Look where you want to go, not at the pole.', 'और धीरे चलाएँ। जहाँ जाना है वहाँ देखें, खंभे को नहीं।') },
    { t: o('No helmet or seatbelt', 'हेलमेट या सीटबेल्ट नहीं'), fix: o('Put it on before you start the engine.', 'इंजन चालू करने से पहले पहन लें।') },
    { t: o('Vehicle papers missing', 'वाहन के कागज़ नहीं'), fix: o('Carry RC, insurance and PUC. Check expiry dates the day before.', 'RC, बीमा और PUC साथ रखें। एक दिन पहले तारीखें जाँच लें।') },
  ],
};

// Test-day guide for the online learner's test
export const testDay = {
  before: [
    o('Sit in a quiet, well-lit room. Light should fall on your face.', 'शांत, रोशनी वाले कमरे में बैठें। रोशनी चेहरे पर पड़े।'),
    o('Charge your phone and use stable internet.', 'फ़ोन चार्ज करें और अच्छा इंटरनेट रखें।'),
    o('Keep your application number ready.', 'अपनी आवेदन संख्या तैयार रखें।'),
  ],
  during: [
    o('Keep your face inside the camera frame the whole time.', 'पूरे समय अपना चेहरा कैमरे के फ़्रेम में रखें।'),
    o('Tap one answer, then tap "Next". You cannot go back.', 'एक जवाब चुनें, फिर "आगे" दबाएँ। वापस नहीं जा सकते।'),
    o('Watch the timer at the top. If time runs out, it moves on.', 'ऊपर टाइमर देखें। समय खत्म होने पर सवाल बदल जाता है।'),
  ],
  screenParts: [
    { id: 'timer', t: o('Timer', 'टाइमर'), d: o('Seconds left for this question', 'इस सवाल के लिए बचे सेकंड') },
    { id: 'count', t: o('Question count', 'सवाल संख्या'), d: o('Which question you are on', 'आप कौन से सवाल पर हैं') },
    { id: 'options', t: o('Answer options', 'जवाब के विकल्प'), d: o('Tap the circle next to one answer', 'एक जवाब के पास वाले गोले को दबाएँ') },
    { id: 'next', t: o('Next button', 'आगे बटन'), d: o('Saves your answer and moves on', 'जवाब सेव करके आगे बढ़ता है') },
  ],
};
