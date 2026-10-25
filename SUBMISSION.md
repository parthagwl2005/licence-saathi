# Licence Saathi · लाइसेंस साथी: submission text

## Links
- **Live app:** `<your Vercel or Netlify link>` (demo PIN `2580`, DigiLocker demo OTP `123456`, best on a phone)
- **Code:** `https://github.com/<your-username>/licence-saathi`
- **Pitch deck:** `Licence-Saathi-Pitch.pdf`
- **Demo video:** `<your video link>`

## Short description (1–2 lines)
Licence Saathi is a calm, bilingual (Hindi/English) companion to mParivahan for the whole driving licence journey. It is designed for stressed, first-time and low-literacy users, so people stop giving up halfway.

## What we built
A working, installable web app (React + Vite + Tailwind, PWA) covering:
- learner's licence, driving licence, lost licence, renewal and change of address
- "Do I need the RTO?"
- application tracking
- learning (signs, rules, flashcards), a mock test, test-day rehearsal and a driving test guide
- an AI helper (Gemini, with built-in answers as backup)
- a help and safety centre

It works offline after the first visit and reads ID cards on the phone. Data stays on the device.

Every application (learner's licence, driving licence, lost, renew, change of address, add a vehicle, international permit) starts with one question: **use my saved details, get them from DigiLocker, or fill it myself**. Then it shows the standard fields every licence form asks for (name, father's/husband's name, date of birth, gender, mobile, email, address, PIN code, state), all editable, with a tag showing where each came from. DigiLocker is a working demo: OTP, consent to share Aadhaar, licence and Class 10 marksheet, digital copies you can view and save, and every number checked (Aadhaar checksum, licence format, PIN code). Saved details are encrypted on the phone (AES-256) and open only with a PIN or the phone's own screen lock (WebAuthn). New: **lock with fingerprint, face or phone screen lock** (PIN as backup), and a half-filled form that is closed shows only "Your form is safe and locked" until the owner unlocks it (16/16 automated security checks passed). **"What happened?"** lets people describe a problem in Hindi, English or Hinglish with typos; AI (or an offline matcher) finds the fix, the right page and the official link. **Road sense** is a road-situation game: red light, indicators, hazard lights, zebra crossing, ambulance, U-turn; no lives, kind feedback. **Home knows where you are:** the top card changes (and changes colour) with your situation: learner's licence applied, holding it (days held, countdown to day 30, expiry date, calendar reminders), permanent licence applied, test booked, passed, or a lost-licence request. One next step sits right under the headline, and "What you've already done" lists every step with its date, so nobody has to remember. Calm mode and easier-reading spacing help on hard days. Everything is simulated, as the brief allows: there is no government connection, and fees, rules and numbers are samples.

## The problem
People don't fail at the licence; they give up halfway. Our persona is Sunil, 38: stressed, forgetful, hard on himself, not confident with apps. He lost his licence, opened the official app three times, saw a wall of options and closed it. Stress and ADHD weaken planning, working memory and getting started, and government apps demand exactly those.

## Problems we solved, and how
1. **Too much on one screen.** One question per screen, 2–3 choices, and one next step with the minutes it takes.
2. **Typing the same details again.** Every form first asks how to fill it: your saved details, DigiLocker, or fill it yourself. All fields stay editable, and you can save them for next time.
3. **Long numbers typed wrong.** The licence number is auto-fixed as you type (O→0, spaces), shown in groups and checked part by part, with a "Where is it?" picture.
4. **Rejected for a name mismatch.** The Rejection Shield compares the form with the ID card before you pay and offers a one-tap fix.
5. **Not knowing the RTO isn't needed.** A two-question legal check, based on S.O. 4353(E), 16 Sept 2022.
6. **Panic after losing a licence.** The first screen calms you: your digital licence is valid, it's usually online, and it takes about 5 minutes.
7. **Server busy or payment fails.** "Not your fault. Nothing is lost." The app retries by itself.
8. **Leaving halfway.** Auto-save on every tap, Pause, and a calendar reminder at a time you choose.
9. **Not knowing what's next, or when.** Home changes with your situation and shows one next step, days held, the day-30 countdown and the expiry date, with calendar reminders.
10. **Forgetting what you already did.** "What you've already done" with dates, plus a tracker for each application.
11. **Jargon and scary words.** Class 8 language, "What does this mean?" for terms, and kind error messages.
12. **Language and reading.** Hindi and English with a helper line in the other language, plus read-aloud.
13. **Weak eyes and sunlight.** 3 text sizes, high contrast, dark mode and an animations-off switch.
14. **Cheap phones and no internet.** A light app that works offline.
15. **Failing the learner's test.** Lessons, practice with instant explanations, a mistakes review and a readiness meter.
16. **Fear of test day.** A rehearsal of what happens, and what examiners check.
17. **No one to ask.** Ask in your own words and language; the help centre writes your complaint.
18. **Privacy fear.** The app starts blank. Saved details are encrypted on the phone and open only with a 4-digit PIN or the phone's own fingerprint/face lock, like a bank app. Forget them any time. The Aadhaar number is never stored.
19. **Not knowing what went wrong.** "What happened?": say it your way (Hindi, English, Hinglish, typos fine) and get the fix, the right page and the official link.
20. **Knowing rules but not reading the road.** Road sense game: real situations, choose what to do, learn the safe way without fear of failing.

## Proof
- 0 accessibility errors on all 20 screens (axe-core, WCAG 2.2 AA), including Hindi at the largest text size.
- 0 text cut off on a 360px phone screen.
- Reporting a lost licence takes 11 taps plus your PIN, with 1 thing typed.
- Security test: 16 of 16 checks passed (close a half-filled form, reopen, a stranger tries, owner unlocks with fingerprint, auto-lock).
- Built on psychology research: Arnsten 2009 (stress and planning), Eysenck et al. 2007 (anxiety and attention), Grupe & Nitschke 2013 (uncertainty), Masicampo & Baumeister 2011 (unfinished tasks), Sonuga-Barke 2003 (ADHD delay aversion), Breines & Chen 2012 (self-compassion), Horswill et al. 2015 (hazard perception). Full table in PROOF.md.
- About 50 design decisions are each tied to research or a standard: WCAG 2.2, W3C COGA, GOV.UK patterns, and stress and ADHD research. See PROOF.md.

## Honest limits and next steps
It is not yet tested with diagnosed users. Next steps:
- user testing at an RTO and a cyber café
- connect the real DigiLocker partner API (a working demo today) and Aadhaar QR
- Sarathi integration with MoRTH approval
- more languages, with native-speaker review
