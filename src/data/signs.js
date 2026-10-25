// Traffic signs taught on the Learn screen. The drawings live in src/components/Sign.jsx (inline SVG, keyed by id).

export const signCategories = [
  { id: 'mandatory', en: 'Must-follow signs', hi: 'ज़रूरी पालन वाले संकेत', desc: { en: 'Round signs. You must obey them.', hi: 'गोल संकेत। इनका पालन करना ज़रूरी है।' } },
  { id: 'cautionary', en: 'Warning signs', hi: 'चेतावनी संकेत', desc: { en: 'Triangle signs. They warn you about the road ahead.', hi: 'तिकोने संकेत। ये आगे की सड़क के बारे में चेतावनी देते हैं।' } },
  { id: 'informatory', en: 'Information signs', hi: 'जानकारी वाले संकेत', desc: { en: 'Blue rectangle signs. They tell you about useful places.', hi: 'नीले चौकोर संकेत। ये काम की जगहों के बारे में बताते हैं।' } },
];

export const signs = [
  // Mandatory
  { id: 'stop', cat: 'mandatory', name: { en: 'Stop', hi: 'रुकें' }, meaning: { en: 'Stop fully at the line. Go only when the road is clear.', hi: 'लाइन पर पूरी तरह रुकें। सड़क खाली होने पर ही आगे बढ़ें।' } },
  { id: 'give-way', cat: 'mandatory', name: { en: 'Give way', hi: 'रास्ता दें' }, meaning: { en: 'Slow down and let traffic on the main road go first.', hi: 'धीमे हो जाएँ और मुख्य सड़क के वाहनों को पहले जाने दें।' } },
  { id: 'no-entry', cat: 'mandatory', name: { en: 'No entry', hi: 'प्रवेश निषेध' }, meaning: { en: 'Vehicles must not enter this road.', hi: 'इस सड़क पर वाहन अंदर नहीं जा सकते।' } },
  { id: 'no-u-turn', cat: 'mandatory', name: { en: 'No U-turn', hi: 'यू-टर्न निषेध' }, meaning: { en: 'You must not turn around here.', hi: 'यहाँ वाहन वापस घुमाना मना है।' } },
  { id: 'no-overtaking', cat: 'mandatory', name: { en: 'No overtaking', hi: 'ओवरटेक करना मना है' }, meaning: { en: 'Do not pass the vehicle in front of you.', hi: 'आगे वाले वाहन से आगे निकलना मना है।' } },
  { id: 'no-parking', cat: 'mandatory', name: { en: 'No parking', hi: 'पार्किंग निषेध' }, meaning: { en: 'Do not park your vehicle here.', hi: 'यहाँ वाहन खड़ा न करें।' } },
  { id: 'horn-prohibited', cat: 'mandatory', name: { en: 'No horn', hi: 'हॉर्न बजाना मना है' }, meaning: { en: 'Do not use your horn. Often near hospitals and schools.', hi: 'हॉर्न न बजाएँ। यह अक्सर अस्पताल और स्कूल के पास होता है।' } },
  { id: 'speed-50', cat: 'mandatory', name: { en: 'Speed limit 50', hi: 'गति सीमा 50' }, meaning: { en: 'Do not go faster than 50 km per hour.', hi: '50 किलोमीटर प्रति घंटा से तेज़ न चलें।' } },
  { id: 'no-right-turn', cat: 'mandatory', name: { en: 'No right turn', hi: 'दाएँ मुड़ना मना है' }, meaning: { en: 'You must not turn right here.', hi: 'यहाँ दाईं ओर मुड़ना मना है।' } },
  { id: 'keep-left', cat: 'mandatory', name: { en: 'Keep left', hi: 'बाएँ चलें' }, meaning: { en: 'Pass on the left side of this sign.', hi: 'इस संकेत के बाईं ओर से निकलें।' } },
  // Cautionary
  { id: 'right-curve', cat: 'cautionary', name: { en: 'Right bend ahead', hi: 'आगे दायाँ मोड़' }, meaning: { en: 'The road turns right ahead. Slow down.', hi: 'आगे सड़क दाईं ओर मुड़ती है। धीमे चलें।' } },
  { id: 'hump', cat: 'cautionary', name: { en: 'Speed breaker', hi: 'स्पीड ब्रेकर' }, meaning: { en: 'A bump on the road ahead. Slow down.', hi: 'आगे सड़क पर उभार है। धीमे चलें।' } },
  { id: 'cross-road', cat: 'cautionary', name: { en: 'Crossroads ahead', hi: 'आगे चौराहा' }, meaning: { en: 'Roads cross ahead. Look both ways.', hi: 'आगे सड़कें मिलती हैं। दोनों तरफ़ देखें।' } },
  { id: 'school', cat: 'cautionary', name: { en: 'School ahead', hi: 'आगे स्कूल' }, meaning: { en: 'Children may cross. Go slowly and do not honk.', hi: 'बच्चे सड़क पार कर सकते हैं। धीरे चलें, हॉर्न न बजाएँ।' } },
  { id: 'pedestrian-crossing', cat: 'cautionary', name: { en: 'Pedestrian crossing', hi: 'पैदल यात्री क्रॉसिंग' }, meaning: { en: 'People cross here. Be ready to stop.', hi: 'यहाँ लोग सड़क पार करते हैं। रुकने के लिए तैयार रहें।' } },
  { id: 'narrow-road', cat: 'cautionary', name: { en: 'Road narrows', hi: 'आगे सड़क संकरी' }, meaning: { en: 'The road becomes narrow ahead.', hi: 'आगे सड़क पतली हो जाती है।' } },
  { id: 'slippery', cat: 'cautionary', name: { en: 'Slippery road', hi: 'फिसलन भरी सड़क' }, meaning: { en: 'The road may be slippery. Go slowly, brake gently.', hi: 'सड़क फिसलन भरी हो सकती है। धीरे चलें, आराम से ब्रेक लगाएँ।' } },
  // Informatory
  { id: 'hospital', cat: 'informatory', name: { en: 'Hospital', hi: 'अस्पताल' }, meaning: { en: 'A hospital is nearby. Keep quiet, give way.', hi: 'पास में अस्पताल है। शांति रखें, रास्ता दें।' } },
  { id: 'parking', cat: 'informatory', name: { en: 'Parking', hi: 'पार्किंग' }, meaning: { en: 'You can park your vehicle here.', hi: 'यहाँ आप वाहन खड़ा कर सकते हैं।' } },
  { id: 'fuel', cat: 'informatory', name: { en: 'Petrol pump', hi: 'पेट्रोल पंप' }, meaning: { en: 'A petrol pump is ahead.', hi: 'आगे पेट्रोल पंप है।' } },
  { id: 'eating', cat: 'informatory', name: { en: 'Eating place', hi: 'भोजनालय' }, meaning: { en: 'A place to eat is nearby.', hi: 'पास में खाने की जगह है।' } },
];

export const signById = Object.fromEntries(signs.map((s) => [s.id, s]));
