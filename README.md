# Licence Saathi · लाइसेंस साथी

**A calm, bilingual companion to mParivahan for the whole driving licence journey, designed for people on their worst day.**

Hackathon prototype for *Problem Statement 1: Making mParivahan & Driving Licence Services Accessible to Everyone*. It does **not** connect to any government system (see [What is simulated](#what-is-simulated)).

**Try it:** `<your Vercel or Netlify link>` · Demo PIN `2580` · DigiLocker demo OTP `123456` · Best on a phone, or Chrome's phone view (F12 → Ctrl+Shift+M).

---

## The problem, in two lines

Getting or replacing a driving licence means long service lists, official words, long numbers and scary errors, so people who are tired, stressed or unsure with phones give up halfway and blame themselves.
Many also visit the RTO when, by law, most licence services no longer need a visit, and they forget what they already did and what comes next.

## Who it is for

- **Sunil, 38, supervisor (main user).** Stressed, forgetful, hard on himself, not confident with apps. He has just lost his driving licence.
- **Ramesh, 19, first-time learner.** More comfortable in Hindi, on a cheap phone with patchy internet.
- **Anyone else:** older people with weak eyesight, people with ADHD or anxiety, people who read slowly, and people who are simply having a bad day.

## What it does (one line per screen)

| Screen | Route | What it does |
|---|---|---|
| Language | first open | Choose Hindi or English, with an optional small helper line in the other language |
| Home | `/` | Changes with your situation (applied, holding a learner's licence with the day-30 countdown, test booked, lost licence), one next step, "What you've already done" with dates, Calm mode |
| Your details | `/profile` | Starts blank; fill once from DigiLocker (demo), an ID scan or by hand; locked with a PIN or fingerprint/face |
| Lost licence | `/lost` | Calms you first ("you can still drive"), checks whether you need the RTO, fixes a messily typed licence number, then one-screen apply |
| Do I need the RTO? | `/rto-check` | Three taps to "No visit" or "One visit only", with what to bring and the law behind it |
| Service page | `/service/:id` | For renew, change of address, add a vehicle and international permit: what it is, whether you can apply now, fee, documents, steps |
| Check and apply | `/service/:id/apply` | Asks which details to use (saved, DigiLocker, or fill myself); pre-filled editable form; Rejection Shield; retry queue if the server is busy |
| Learner's licence form | `/apply` | One question per screen; asks only what isn't saved; review; simulated payment and receipt |
| Eligibility | `/eligibility` | Can I apply yet? Age and vehicle check in plain words |
| Documents | `/documents` | What you have and what's missing, with where to get each |
| Permanent licence | `/permanent` | Day-30 countdown from the learner's licence, pre-filled application, slot booking, checklist |
| Learn | `/learn` | 21 road signs, 9 short rule lessons, flashcards, read aloud |
| Mock test | `/mock` | Practice with instant explanations, real-test mode with timer, mistakes review, readiness meter |
| Road sense game | `/road-game` | Real road situations (red light, hazard lights, U-turn, ambulance); no lives, kind feedback |
| Test day | `/test-day` | What happens at the online test, plus a 3-question rehearsal in the official layout |
| Driving test | `/driving-test` | Two-wheeler and car steps, and the 5 most common reasons people fail |
| Track | `/track` | Timeline for each application, plus anything still waiting to send |
| Ask | `/chat` | Ask in your own words, Hindi or English; AI (Gemini) answers from our checked facts, with built-in answers as backup |
| What happened? | `/fix` | Describe a problem in Hindi, English or Hinglish, typos fine; get the likely cause, the fix and the official link |
| Help and safety | `/help` | Plain-word error explanations, a complaint written for you, scam warnings, privacy promise |
| Settings | `/settings` | Language, 3 text sizes, dark mode, high contrast, animations off, Calm mode, easier spacing, lock settings, demo switches |

## Design decisions and why

**Plain language.** Official words are the first barrier: a person who doesn't understand a word stops. Every screen uses Class 8 wording, every term (RTO, Form 1A, Sarathi) has a "What does this mean?" tap, and errors never say "invalid" or "penalty". They say what happened and give one fix.

**One step per screen.** Stress and ADHD weaken planning and working memory, so a screen full of choices makes people freeze. Each screen asks one question with 2–3 answers and shows one next step with the minutes it takes. Pause is always there, and nothing is lost.

**Fill once, then only check.** Typing the same details into every form causes mistakes and drop-off. Every form first asks *saved details, DigiLocker, or fill it myself*, then fills itself, with every field still editable.

**Never lose your place, never forget.** The app saves after every tap. Home shows where you are, what you already did (with dates) and what's next. Calendar reminders bring you back on the day it matters, for example day 30 of a learner's licence.

**Offline use.** Many users have weak internet and cheap phones. After the first visit the app works with no internet: lessons, tests, your details and half-filled forms. Applications wait in a queue and send themselves when the internet is back.

**Languages.** Every word exists in Hindi and English, with an optional helper line in the other language. Read-aloud works on lessons and answers. The AI and "What happened?" understand Hinglish and spelling mistakes.

**Accessibility.** Text is 16px or larger and buttons 48px or larger. There are 3 text sizes, high contrast, dark mode, animations off, and Calm mode (softer colours, no movement, only what you need now). Icons always come with words, colour is never the only signal, and everything works with a screen reader.

**Private by default.** The app starts blank. Saved details are encrypted on the phone and open only with a PIN or the phone's fingerprint or face lock, like a bank app. A half-closed form shows nothing until it is unlocked. The Aadhaar number is never stored.

Every decision is tied to published research or a standard (WCAG 2.2, W3C COGA, GOV.UK patterns, stress and ADHD studies) in **[PROOF.md](PROOF.md)**.

## How it improves on the current process

| Today | With Licence Saathi |
|---|---|
| Long service lists named in official terms | A few tiles named by situation: "Lost licence", "Do I need the RTO?" |
| Type the same details into every form | Fill once (or from DigiLocker); every form fills itself and stays editable |
| Long numbers typed by hand; O/0 mix-ups; rejections | Smart number box fixes O/0 and I/1, checks each part, shows where the number is printed |
| Rejected later for a name mismatch | Rejection Shield compares the form with the ID before you pay and offers a one-tap fix |
| People visit the RTO without needing to | Three-tap check based on S.O. 4353(E), 2022 |
| "Error 500", timeouts, lost progress | Plain words, "not your fault", automatic retry, nothing lost |
| No idea what's next or what was already done | Home shows your stage, days held, the day-30 countdown, the next step and a dated history |
| Learning is separate, scary or missing | Lessons, flashcards, mock test, road sense game and test-day rehearsal in one place |
| English-heavy, no help when stuck | Hindi and English everywhere; ask in your own words; complaint written for you |

**Measured:** 0 accessibility errors on all 20 screens (axe-core, WCAG 2.2 AA) including Hindi at the largest text size. No text cut off on a 360px screen. A lost licence takes 11 taps plus a PIN, with 1 thing typed. 16 of 16 security checks pass. Details in [PROOF.md](PROOF.md) and [tests/](tests).

## How to run it

You need **Node.js 18 or newer** (the LTS version from [nodejs.org](https://nodejs.org)).

```bash
npm install
npm run dev          # open http://localhost:5173
```

On Windows PowerShell, if you see "running scripts is disabled", use `npm.cmd install` and `npm.cmd run dev`, or switch the VS Code terminal to Command Prompt.

**AI (optional).** Create a file named `.env` next to `package.json` with one line: `GEMINI_API_KEY=your-key` (free key from [Google AI Studio](https://aistudio.google.com/apikey)), then restart. Without a key everything still works: the chat and "What happened?" use built-in answers. The key stays on the server and `.env` is never uploaded to GitHub.

**On your phone (same Wi-Fi):** `npm run dev -- --host` and open the "Network" address. Fingerprint lock needs `localhost` or `https`, so use the PIN over Wi-Fi, or test the fingerprint on the online link.

**Production build:** `npm run build`, then `npm run preview` (http://localhost:4173, offline mode works here).

**Put it online:** see [DEPLOY.md](DEPLOY.md). **Demo script:** see [DEMO.md](DEMO.md).

### Quick tour for judges
1. Choose a language. On Home, tap **Your details → Get from DigiLocker → Sunil**, OTP `123456`, then **Save** and choose a PIN.
2. **Lost licence → Let's start** and follow it to the end.
3. Try **Something went wrong?** and type *paise kat gaye receipt nahi aayi*.
4. Tap **हिं** at the top, then ☰ → सेटिंग्स → **A++**, and go back through any screen.

## What is simulated

| Simulated | Real |
|---|---|
| Government submission, application numbers and status | Encryption of saved details (AES-256-GCM), PIN and fingerprint/face lock (WebAuthn) |
| DigiLocker (demo accounts Sunil and Ramesh, OTP `123456`, sample documents) | Number checks: Aadhaar checksum, licence format, PIN code |
| Payments, slot booking, RTO list | On-device ID scanning (Tesseract) |
| Fees and some rules (samples; they differ by state) | Offline app, send queue with retry, calendar reminders (.ics) |
| The "busy server" (switch in Settings) | AI answers (Gemini) when a key is set, limited to our checked facts and links |

The laws quoted are real: S.O. 4353(E) of 16 Sept 2022 (58 services online with Aadhaar), GSR 394(E) of 2021 (accredited driving schools), the 2018 advisory that DigiLocker and mParivahan licences are valid, the IT Act 2000, and the Motor Vehicles Act 1988 with CMVR 1989.

## What we'd build next

1. **Test with real users** at an RTO and a cyber café, including people with ADHD and older users, and fix what they struggle with.
2. **Real DigiLocker and Sarathi** through the official partner APIs, with Ministry approval, so applications are actually submitted and tracked.
3. **Aadhaar Secure QR** reading for exact details with no typing.
4. **More languages with voice** (Tamil, Bengali, Marathi, Telugu), checked by native speakers, plus a voice-only mode for people who can't read.
5. **Inside mParivahan.** These patterns (one step per screen, fill once, the Rejection Shield, situation-aware home) can go straight into the official app.

## Code map

- `src/screens/`: one file per screen
- `src/data/`: rules, fees, laws, services, questions, fixes; content is data, so it can be corrected without touching screens
- `src/i18n/`: every word in English and Hindi
- `src/situation.js`: what stage you are at, and what you already did
- `src/vault.js` and `src/components/Lock.jsx`: encryption, PIN and fingerprint lock
- `src/components/FillForm.jsx` and `DigiLocker.jsx`: the "which details?" chooser and the DigiLocker demo
- `server/chat-core.js`: the AI endpoint, served by `vite.config.js` locally, `api/chat.js` on Vercel and `netlify/functions/chat.js` on Netlify
- `tests/`: security, journeys, situations and "What happened?" tests (Playwright)
