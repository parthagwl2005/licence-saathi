// "Road sense": short road situations. You are driving; something happens; what do you do?
// Answers follow India's Motor Vehicles (Driving) Regulations, 2017 and the learner's licence question bank.
// scene: what the road picture shows. action: what your car does after a correct answer.
const o = (en, hi) => ({ en, hi });

export const rounds = [
  {
    id: 'red', scene: { light: 'red' }, action: 'stop',
    q: o('The traffic light ahead turns red. What do you do?', 'आगे की बत्ती लाल हो गई। आप क्या करेंगे?'),
    options: [
      { id: 'stop', t: o('Stop behind the white line', 'सफ़ेद लाइन के पीछे रुकें') },
      { id: 'fast', t: o('Speed up to cross quickly', 'तेज़ चलाकर जल्दी निकल जाएँ') },
      { id: 'horn', t: o('Honk and keep going', 'हॉर्न बजाकर चलते रहें') },
    ],
    answer: 'stop',
    why: o('Red means stop. Stop behind the stop line and wait for green.', 'लाल का मतलब रुकना है। स्टॉप लाइन के पीछे रुकें और हरी बत्ती का इंतज़ार करें।'),
  },
  {
    id: 'amber', scene: { light: 'amber' }, action: 'slow',
    q: o('The light turns yellow (amber) while you are still some distance away.', 'आप थोड़ी दूर हैं और बत्ती पीली हो गई।'),
    options: [
      { id: 'slow', t: o('Slow down and stop, if you can do it safely', 'धीमे करें और रुकें, अगर सुरक्षित रूप से रुक सकें') },
      { id: 'fast', t: o('Speed up to beat the red light', 'लाल होने से पहले तेज़ी से निकलें') },
      { id: 'brake', t: o('Brake very hard at once', 'तुरंत बहुत ज़ोर से ब्रेक लगाएँ') },
    ],
    answer: 'slow',
    why: o('Amber means the light is about to turn red. Slow down and stop if it is safe. Only continue if you are too close to stop safely.', 'पीली बत्ती का मतलब है कि बत्ती लाल होने वाली है। सुरक्षित हो तो धीमे होकर रुकें। सिर्फ़ तब आगे बढ़ें जब आप सुरक्षित रूप से रुकने के लिए बहुत पास हों।'),
  },
  {
    id: 'left-ind', scene: { car: 'left' }, action: 'slow',
    q: o('The car in front shows its LEFT indicator.', 'आगे वाली गाड़ी का बायाँ इंडिकेटर जल रहा है।'),
    options: [
      { id: 'slow', t: o('Slow down, keep a gap and let it turn', 'धीमे करें, दूरी रखें और उसे मुड़ने दें') },
      { id: 'pass', t: o('Overtake it from the left side', 'बाईं तरफ़ से ओवरटेक करें') },
      { id: 'horn', t: o('Honk so it moves faster', 'हॉर्न बजाएँ ताकि वह जल्दी हटे') },
    ],
    answer: 'slow',
    why: o('It is going to slow down and turn left. Slow down and keep a safe gap. Never overtake from the left.', 'वह धीमी होकर बाएँ मुड़ेगी। धीमे करें और सुरक्षित दूरी रखें। बाईं तरफ़ से कभी ओवरटेक न करें।'),
  },
  {
    id: 'hazard', scene: { car: 'hazard' }, action: 'slow',
    q: o('The car in front has BOTH indicators blinking.', 'आगे वाली गाड़ी के दोनों इंडिकेटर एक साथ जल-बुझ रहे हैं।'),
    options: [
      { id: 'slow', t: o('Slow down and be ready to stop', 'धीमे करें और रुकने के लिए तैयार रहें') },
      { id: 'same', t: o('Keep the same speed', 'उसी रफ़्तार से चलते रहें') },
      { id: 'flash', t: o('Flash your lights and honk', 'लाइट चमकाएँ और हॉर्न बजाएँ') },
    ],
    answer: 'slow',
    why: o('Both indicators (hazard lights) mean a problem or danger ahead: a breakdown, an accident or a sudden stop. Slow down and pass only when it is safe.', 'दोनों इंडिकेटर (हैज़र्ड लाइट) का मतलब है आगे कोई खतरा या दिक्कत: गाड़ी खराब, हादसा या अचानक रुकना। धीमे करें और सुरक्षित हो तभी आगे निकलें।'),
  },
  {
    id: 'right-ind', scene: { car: 'right' }, action: 'slow',
    q: o('You want to overtake, but the car in front shows its RIGHT indicator.', 'आप ओवरटेक करना चाहते हैं, पर आगे वाली गाड़ी का दायाँ इंडिकेटर जल रहा है।'),
    options: [
      { id: 'wait', t: o('Wait behind it. Do not overtake now', 'उसके पीछे रुकें। अभी ओवरटेक न करें') },
      { id: 'right', t: o('Overtake quickly from the right', 'दाईं तरफ़ से जल्दी ओवरटेक करें') },
      { id: 'left', t: o('Overtake from the left instead', 'बाईं तरफ़ से ओवरटेक करें') },
    ],
    answer: 'wait',
    why: o('It is about to move right or turn right. Wait until it has turned and the road is clear. Overtake only from the right, and only when it is safe.', 'वह दाईं ओर हटने या मुड़ने वाली है। उसके मुड़ने और रास्ता साफ़ होने तक रुकें। ओवरटेक सिर्फ़ दाईं ओर से, और सिर्फ़ सुरक्षित होने पर करें।'),
  },
  {
    id: 'ambulance', scene: { ambulance: true }, action: 'left',
    q: o('An ambulance with a siren is coming from behind.', 'पीछे से सायरन बजाती एम्बुलेंस आ रही है।'),
    options: [
      { id: 'left', t: o('Move to the left and let it pass', 'बाईं ओर हटें और उसे जाने दें') },
      { id: 'fast', t: o('Speed up so you stay ahead', 'तेज़ चलाएँ ताकि आगे बने रहें') },
      { id: 'stop', t: o('Stop in the middle of the road', 'सड़क के बीच में रुक जाएँ') },
    ],
    answer: 'left',
    why: o('Always give way to ambulances and fire engines. Move to the left side and slow down or stop safely until it passes.', 'एम्बुलेंस और दमकल को हमेशा रास्ता दें। बाईं ओर हटें और उसके निकलने तक धीमे करें या सुरक्षित जगह रुकें।'),
  },
  {
    id: 'zebra', scene: { zebra: 'walking' }, action: 'stop',
    q: o('A person is walking on the zebra crossing ahead.', 'आगे ज़ेबरा क्रॉसिंग पर कोई व्यक्ति चल रहा है।'),
    options: [
      { id: 'stop', t: o('Stop before the crossing and let them cross', 'क्रॉसिंग से पहले रुकें और उन्हें पार करने दें') },
      { id: 'horn', t: o('Honk so they hurry', 'हॉर्न बजाएँ ताकि वे जल्दी करें') },
      { id: 'around', t: o('Drive around them', 'उनके बगल से निकल जाएँ') },
    ],
    answer: 'stop',
    why: o('People on a zebra crossing always go first. Stop before the stripes and wait until they have crossed.', 'ज़ेबरा क्रॉसिंग पर पैदल चलने वाले हमेशा पहले जाते हैं। धारियों से पहले रुकें और उनके पार होने तक इंतज़ार करें।'),
  },
  {
    id: 'green-ped', scene: { light: 'green', zebra: 'walking' }, action: 'stop',
    q: o('Your light is green, but someone is still crossing in front of you.', 'आपकी बत्ती हरी है, पर कोई अभी भी आपके सामने सड़क पार कर रहा है।'),
    options: [
      { id: 'stop', t: o('Wait until they have crossed', 'उनके पार होने तक रुकें') },
      { id: 'go', t: o('Go: green means go', 'चलें: हरी का मतलब चलना है') },
      { id: 'horn', t: o('Honk and move slowly towards them', 'हॉर्न बजाकर धीरे-धीरे उनकी ओर बढ़ें') },
    ],
    answer: 'stop',
    why: o('Green means you may go when the way is clear. A person on the road must be allowed to finish crossing first.', 'हरी बत्ती का मतलब है रास्ता साफ़ हो तो चल सकते हैं। सड़क पर मौजूद व्यक्ति को पहले पार करने दें।'),
  },
  {
    id: 'no-uturn', scene: { sign: 'no-u-turn' }, action: 'go',
    q: o('You need to go back the other way, but you see this sign.', 'आपको वापस दूसरी ओर जाना है, पर यह संकेत दिखा।'),
    options: [
      { id: 'go', t: o('Go ahead to the next place where a U-turn is allowed', 'आगे वहाँ तक जाएँ जहाँ यू-टर्न की अनुमति हो') },
      { id: 'quick', t: o('Take a quick U-turn here if no one is coming', 'कोई न आ रहा हो तो यहीं जल्दी यू-टर्न लें') },
      { id: 'reverse', t: o('Reverse back along the road', 'सड़क पर पीछे की ओर रिवर्स करें') },
    ],
    answer: 'go',
    why: o('This sign means U-turns are not allowed here. Continue to a place where turning is allowed.', 'इस संकेत का मतलब है यहाँ यू-टर्न मना है। आगे वहाँ तक जाएँ जहाँ मुड़ने की अनुमति हो।'),
  },
  {
    id: 'uturn', scene: { uturn: true }, action: 'slow',
    q: o('A U-turn is allowed at the gap ahead. How do you take it?', 'आगे के कट पर यू-टर्न की अनुमति है। आप कैसे मुड़ेंगे?'),
    options: [
      { id: 'safe', t: o('Signal right, slow down, check mirrors and oncoming traffic, turn when clear', 'दायाँ इंडिकेटर दें, धीमे करें, शीशे और सामने का ट्रैफ़िक देखें, रास्ता साफ़ हो तब मुड़ें') },
      { id: 'fast', t: o('Turn fast without a signal', 'बिना इंडिकेटर के तेज़ी से मुड़ें') },
      { id: 'stop', t: o('Stop in the gap and wave at other cars', 'कट में रुककर दूसरी गाड़ियों को हाथ दिखाएँ') },
    ],
    answer: 'safe',
    why: o('Signal early, slow down, check behind and ahead, give way to traffic coming towards you, then turn.', 'पहले से इंडिकेटर दें, धीमे करें, पीछे और आगे देखें, सामने से आने वाले ट्रैफ़िक को रास्ता दें, फिर मुड़ें।'),
  },
  {
    id: 'school', scene: { sign: 'school' }, action: 'slow',
    q: o('You see this sign near a school.', 'स्कूल के पास आपको यह संकेत दिखता है।'),
    options: [
      { id: 'slow', t: o('Slow down and watch for children', 'धीमे करें और बच्चों पर ध्यान दें') },
      { id: 'horn', t: o('Honk to warn children and keep speed', 'बच्चों को सावधान करने के लिए हॉर्न बजाएँ और रफ़्तार न बदलें') },
      { id: 'same', t: o('Nothing changes', 'कुछ नहीं बदलता') },
    ],
    answer: 'slow',
    why: o('Children may run onto the road suddenly. Slow down and be ready to stop.', 'बच्चे अचानक सड़क पर आ सकते हैं। धीमे करें और रुकने के लिए तैयार रहें।'),
  },
  {
    id: 'hump', scene: { sign: 'hump', hump: true }, action: 'slow',
    q: o('A speed breaker is ahead.', 'आगे स्पीड ब्रेकर है।'),
    options: [
      { id: 'slow', t: o('Slow down before it', 'उससे पहले धीमे करें') },
      { id: 'side', t: o('Drive around it from the side', 'बगल से निकल जाएँ') },
      { id: 'same', t: o('Keep your speed', 'रफ़्तार वही रखें') },
    ],
    answer: 'slow',
    why: o('Slow down before the speed breaker. Going around it puts you in the way of others.', 'स्पीड ब्रेकर से पहले धीमे करें। बगल से निकलना दूसरों के रास्ते में आना है।'),
  },
  {
    id: 'rain', scene: { rain: true, sign: 'slippery' }, action: 'slow',
    q: o('It is raining and the road is slippery.', 'बारिश हो रही है और सड़क फिसलन भरी है।'),
    options: [
      { id: 'slow', t: o('Slow down and keep a bigger gap', 'धीमे करें और ज़्यादा दूरी रखें') },
      { id: 'brake', t: o('Drive normally and brake hard if needed', 'सामान्य चलाएँ और ज़रूरत हो तो ज़ोर से ब्रेक लगाएँ') },
      { id: 'close', t: o('Follow the car in front closely to see its path', 'आगे वाली गाड़ी के एकदम पीछे चलें') },
    ],
    answer: 'slow',
    why: o('Wet roads need more distance to stop. Slow down, keep a bigger gap and avoid sudden braking.', 'गीली सड़क पर रुकने में ज़्यादा दूरी लगती है। धीमे करें, ज़्यादा दूरी रखें और अचानक ब्रेक न लगाएँ।'),
  },
  {
    id: 'stop-sign', scene: { sign: 'stop' }, action: 'stop',
    q: o('There is a STOP sign at the junction and no one seems to be coming.', 'चौराहे पर STOP का संकेत है और कोई आता नहीं दिख रहा।'),
    options: [
      { id: 'stop', t: o('Stop fully, look both ways, then go', 'पूरी तरह रुकें, दोनों ओर देखें, फिर चलें') },
      { id: 'roll', t: o('Slow down and roll through', 'धीमे होकर निकल जाएँ') },
      { id: 'go', t: o('Go: the road is empty', 'चलें: सड़क खाली है') },
    ],
    answer: 'stop',
    why: o('A STOP sign means a full stop every time, even if the road looks empty. Then go when it is clear.', 'STOP संकेत का मतलब हर बार पूरी तरह रुकना है, सड़क खाली दिखे तब भी। फिर रास्ता साफ़ हो तो चलें।'),
  },
];

export const ROUNDS_PER_GAME = 8;
export const QUICK_SECONDS = 10;
