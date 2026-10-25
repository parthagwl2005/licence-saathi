// Every service on the Home screen. Sample rules and fees: check with your state's RTO.
// group: 'apply' (things you apply for) or 'prepare' (learning and guides)
// to: an existing in-app flow. Services without `to` use the one-screen apply flow.
// docs: document ids from src/data/content.js `documents` plus 'licence' (your current licence) and 'police' (police report).
// extra: one service-specific question asked in the apply flow.

const o = (en, hi) => ({ en, hi });

export const services = [
  {
    id: 'll', group: 'apply', tint: 'sage', anim: 'lplate',
    title: o("Learner's licence", 'लर्नर लाइसेंस'),
    short: o('Your first step', 'आपका पहला कदम'),
    what: o('A temporary licence to practise driving with an "L" sign. You pass a short test on road rules to get it.', '"L" निशान के साथ अभ्यास करने का अस्थायी लाइसेंस। सड़क नियमों की छोटी परीक्षा पास करके मिलता है।'),
    when: o('From 18 for a motorcycle or car. From 16 for a 50cc scooter with a parent\'s consent.', 'मोटरसाइकिल या कार के लिए 18 साल से। 50cc स्कूटर के लिए 16 साल से, माता-पिता की सहमति के साथ।'),
    feeKey: 'll',
    docs: ['age', 'address', 'photo', 'signature'],
    steps: [o('Check your details', 'अपनी जानकारी जाँचें'), o('Pay the fee', 'शुल्क दें'), o('Pass the learner\'s test', 'लर्नर टेस्ट पास करें')],
    to: '/apply', faq: ['what-ll', 'test-format', 'docs'],
  },
  {
    id: 'dl', group: 'apply', tint: 'sky', anim: 'card',
    title: o('Driving licence', 'ड्राइविंग लाइसेंस'),
    short: o('Your permanent licence', 'आपका स्थायी लाइसेंस'),
    what: o('Your full licence. You apply after your learner\'s licence and pass a driving test at the RTO.', 'आपका पूरा लाइसेंस। लर्नर लाइसेंस के बाद आवेदन करें और RTO पर ड्राइविंग टेस्ट पास करें।'),
    when: o('30 days after your learner\'s licence, and before it ends (6 months).', 'लर्नर लाइसेंस के 30 दिन बाद, और उसके खत्म होने (6 महीने) से पहले।'),
    feeKey: 'dl',
    docs: ['age', 'address', 'photo', 'signature'],
    steps: [o('Enter your learner\'s licence date', 'लर्नर लाइसेंस की तारीख डालें'), o('Book a driving test', 'ड्राइविंग टेस्ट बुक करें'), o('Pass the test', 'टेस्ट पास करें')],
    to: '/permanent', faq: ['dl-when', 'driving-test', 'own-vehicle'],
  },
  {
    id: 'add', group: 'more', tint: 'butter', anim: 'addcar',
    title: o('Add a vehicle', 'नया वाहन जोड़ें'),
    short: o('Bike licence, now a car', 'बाइक के बाद अब कार'),
    what: o('Add another vehicle type, like a car, to the licence you already have. You first get a learner\'s licence for it.', 'अपने मौजूदा लाइसेंस में नया वाहन प्रकार, जैसे कार, जोड़ें। पहले उसके लिए लर्नर लाइसेंस लेते हैं।'),
    when: o('Any time you hold a valid licence.', 'जब भी आपके पास वैध लाइसेंस हो।'),
    fee: 450, docs: ['licence', 'age', 'address', 'photo'],
    steps: [o('Check your details', 'अपनी जानकारी जाँचें'), o('Learner\'s test for the new vehicle', 'नए वाहन का लर्नर टेस्ट'), o('Driving test', 'ड्राइविंग टेस्ट')],
    extra: { key: 'licenceNo', type: 'text' }, faq: ['two-classes', 'driving-test'],
  },
  {
    id: 'renew', group: 'apply', tint: 'lilac', anim: 'renew',
    title: o('Renew licence', 'लाइसेंस नवीनीकरण'),
    short: o('Expiring or expired', 'खत्म हो रहा है या हो गया'),
    what: o('Get a fresh licence when yours is about to end or has ended.', 'जब आपका लाइसेंस खत्म होने वाला हो या हो गया हो, तब नया बनवाएँ।'),
    when: o('Up to one year before it ends. Renew soon after it ends to avoid extra steps.', 'खत्म होने से एक साल पहले तक। खत्म होने के बाद जल्दी करें, ताकि अतिरिक्त कदम न लगें।'),
    fee: 400, docs: ['licence', 'photo', 'signature', 'form1a'],
    steps: [o('Check your details', 'अपनी जानकारी जाँचें'), o('Pay the fee', 'शुल्क दें'), o('New card comes by post', 'नया कार्ड डाक से आएगा')],
    extra: { key: 'licenceNo', type: 'text' }, faq: ['renew', 'form1a'],
  },
  {
    id: 'duplicate', group: 'apply', tint: 'blush', anim: 'lost', entry: '/lost',
    title: o('Lost licence', 'लाइसेंस खो गया'),
    short: o('Lost or damaged', 'खो गया या खराब हो गया'),
    what: o('Get a duplicate copy if your licence card is lost, stolen or damaged.', 'लाइसेंस कार्ड खो जाए, चोरी हो जाए या खराब हो जाए तो उसकी डुप्लीकेट कॉपी लें।'),
    when: o('Any time. If it was stolen, file a police report first.', 'कभी भी। चोरी हुआ हो तो पहले पुलिस रिपोर्ट दर्ज कराएँ।'),
    fee: 250, docs: ['police', 'address', 'photo'],
    steps: [o('Check your details', 'अपनी जानकारी जाँचें'), o('Add the police report', 'पुलिस रिपोर्ट जोड़ें'), o('Card comes by post', 'कार्ड डाक से आएगा')],
    extra: { key: 'licenceNo', type: 'text' }, faq: ['lost'],
  },
  {
    id: 'address', group: 'apply', tint: 'sand', anim: 'pin',
    title: o('Change address', 'पता बदलें'),
    short: o('Moved to a new home', 'नए घर में आ गए'),
    what: o('Update the address printed on your licence after you move.', 'घर बदलने के बाद लाइसेंस पर छपा पता बदलें।'),
    when: o('Within 30 days of moving is best.', 'घर बदलने के 30 दिन के अंदर करना सबसे अच्छा है।'),
    fee: 200, docs: ['licence', 'address'],
    steps: [o('Update your address once', 'पता एक बार बदलें'), o('Add new address proof', 'नए पते का प्रमाण जोड़ें'), o('Card comes by post', 'कार्ड डाक से आएगा')],
    extra: { key: 'licenceNo', type: 'text' }, faq: ['address-proof'],
  },
  {
    id: 'idp', group: 'more', tint: 'sky', anim: 'plane',
    title: o('Drive abroad', 'विदेश में चलाएँ'),
    short: o('International permit', 'अंतरराष्ट्रीय परमिट'),
    what: o('An International Driving Permit lets you drive in many other countries for one year.', 'अंतरराष्ट्रीय ड्राइविंग परमिट से आप कई देशों में एक साल तक गाड़ी चला सकते हैं।'),
    when: o('When you hold a valid driving licence and plan to travel.', 'जब आपके पास वैध ड्राइविंग लाइसेंस हो और यात्रा की योजना हो।'),
    fee: 1000, docs: ['licence', 'photo', 'address'],
    steps: [o('Check your details', 'अपनी जानकारी जाँचें'), o('Pay the fee', 'शुल्क दें'), o('Collect your permit', 'परमिट लें')],
    extra: { key: 'travelDate', type: 'date' }, faq: ['official'],
  },
  {
    id: 'rto', group: 'apply', tint: 'butter', anim: 'office',
    title: o('Do I need the RTO?', 'क्या RTO जाना ज़रूरी है?'),
    short: o('Find out in 3 taps', '3 टैप में जानें'),
    to: '/rto-check', direct: true,
  },
  {
    id: 'track', group: 'apply', tint: 'sage', anim: 'route',
    title: o('Track application', 'आवेदन देखें'),
    short: o('See where it is', 'देखें कहाँ तक पहुँचा'),
    to: '/track', direct: true,
  },
  {
    id: 'help', group: 'apply', tint: 'lilac', anim: 'help',
    title: o('Something went wrong?', 'कुछ गलत हुआ?'),
    short: o('Plain help, written for you', 'आसान मदद, आपके लिए लिखी हुई'),
    to: '/help', direct: true,
  },
  // ---- Prepare
  { id: 'learn', group: 'prepare', tint: 'butter', anim: 'signal', title: o('Signs & rules', 'संकेत और नियम'), short: o('5 minutes a day', 'रोज़ 5 मिनट'), to: '/learn', direct: true },
  { id: 'game', group: 'prepare', tint: 'sky', anim: 'steer', title: o('Road sense game', 'रोड सेंस गेम'), short: o('What would you do?', 'आप क्या करेंगे?'), to: '/road-game', direct: true },
  { id: 'mock', group: 'prepare', tint: 'sage', anim: 'ticks', title: o('Mock test', 'मॉक टेस्ट'), short: o('Practise for the real one', 'असली टेस्ट का अभ्यास'), to: '/mock', direct: true },
  { id: 'testday', group: 'prepare', tint: 'lilac', anim: 'screen', title: o('Online test', 'ऑनलाइन टेस्ट'), short: o('How the screen works', 'स्क्रीन कैसे काम करती है'), to: '/test-day', direct: true },
  { id: 'drivetest', group: 'prepare', tint: 'blush', anim: 'eight', title: o('Driving test', 'ड्राइविंग टेस्ट'), short: o('What happens there', 'वहाँ क्या होता है'), to: '/driving-test', direct: true },
];

export const serviceById = Object.fromEntries(services.map((s) => [s.id, s]));

// Extra documents used only by some services
export const extraDocs = {
  licence: { name: o('Your current licence', 'आपका मौजूदा लाइसेंस'), what: o('A photo of your driving licence card, or its number.', 'ड्राइविंग लाइसेंस कार्ड की फ़ोटो या उसका नंबर।') },
  police: { name: o('Police report (if stolen)', 'पुलिस रिपोर्ट (चोरी होने पर)'), what: o('A copy of the report you filed at the police station or online.', 'थाने या ऑनलाइन दर्ज की गई रिपोर्ट की कॉपी।') },
};

// Status stages for services that use the one-screen apply flow
export const requestStages = ['applied', 'docs', 'processing', 'printed', 'posted'];
