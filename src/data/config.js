// SAMPLE RULES for the prototype. Change numbers here; every screen reads from this file.
// Real rules and fees vary by state — always check with the state's RTO.

export const config = {
  // Minimum age (years) for each vehicle type
  minAge: {
    gearless50: 16, // gearless two-wheeler up to 50cc, with a parent's consent
    motorcycle: 18, // motorcycle / scooter above 50cc
    car: 18,
    commercial: 20, // transport (commercial) vehicle
  },
  parentConsent: ['gearless50'],

  // Fees in rupees
  fees: {
    llPerClass: 150, // learner's licence, per vehicle class
    llTest: 50, // learner's licence test
    drivingTest: 300,
    licenceIssue: 200,
  },

  // Learner's licence test
  test: {
    count: 15,
    passMark: 9,
    secondsPerQuestion: 30,
  },

  llValidityMonths: 6, // a learner's licence is valid for 6 months
  dlWaitDays: 30, // apply for the permanent licence 30 days after LL is issued
  doctorCertAge: 40, // doctor's certificate (Form 1A) needed at this age or above

  // Sample upload limits for the photo / signature check
  upload: { photoMaxKB: 50, signMaxKB: 30 },

  // Slot booking (simulated)
  slotTimes: ['09:30', '10:30', '11:30', '14:00', '15:00', '16:00'],
  slotDaysAhead: 21,
  closedWeekdays: [0], // Sunday

  vehicles: [
    { id: 'gearless50', cls: 'MCWOG', en: 'Gearless scooter up to 50cc', hi: '50cc तक बिना गियर का स्कूटर' },
    { id: 'motorcycle', cls: 'MCWG', en: 'Motorcycle or scooter', hi: 'मोटरसाइकिल या स्कूटर' },
    { id: 'car', cls: 'LMV', en: 'Car', hi: 'कार' },
    { id: 'commercial', cls: 'TRANS', en: 'Commercial vehicle (taxi, truck)', hi: 'व्यावसायिक वाहन (टैक्सी, ट्रक)' },
  ],

  states: [
    { id: 'DL', en: 'Delhi', hi: 'दिल्ली' },
    { id: 'HR', en: 'Haryana', hi: 'हरियाणा' },
    { id: 'UP', en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
    { id: 'RJ', en: 'Rajasthan', hi: 'राजस्थान' },
    { id: 'PB', en: 'Punjab', hi: 'पंजाब' },
    { id: 'BR', en: 'Bihar', hi: 'बिहार' },
    { id: 'MP', en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' },
    { id: 'MH', en: 'Maharashtra', hi: 'महाराष्ट्र' },
    { id: 'GJ', en: 'Gujarat', hi: 'गुजरात' },
    { id: 'KA', en: 'Karnataka', hi: 'कर्नाटक' },
    { id: 'TN', en: 'Tamil Nadu', hi: 'तमिलनाडु' },
    { id: 'WB', en: 'West Bengal', hi: 'पश्चिम बंगाल' },
  ],

  officialSite: 'https://parivahan.gov.in',
};
