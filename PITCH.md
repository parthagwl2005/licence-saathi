# Licence Saathi: pitch and demo guide

> **The final 3-minute demo script and the live-demo risk list are in [DEMO.md](DEMO.md).** This file keeps the earlier notes, judge questions and AI test questions.

## One-line pitch
> "We didn't design for the ideal user. We designed for Sunil on his worst day. If it works for him, it works for everyone."

## Slides (6 slides, about 3 minutes with the demo)

1. **The person.** Sunil, 38. Tired, under pressure, forgets things, hard on himself. He lost his driving licence. He opened the government app three times, saw a wall of options, felt stupid and closed it.
2. **The problem.** People don't fail at the licence. They give up halfway: too much on screen, long numbers, scary words, fear of the RTO, forgetting. *(Add your own field quotes or numbers here if you collected any.)*
3. **The insight.** By law, most licence services no longer need an RTO visit (S.O. 4353(E), 2022). People don't know, so they still go.
4. **Live demo** (below).
5. **How it works.** Fill once, calm by design, works offline, everything stays on the phone. *(Use the architecture diagram from the README.)*
6. **What's next.** DigiLocker fetch, Aadhaar QR, real AI help, printable pre-filled forms, RTO Connect. Close with the one-line pitch.

## Demo script (2 minutes, on a phone)

**Before you start:** Settings → Start over → English. Then ☰ → Your details → **Get from DigiLocker** → Sunil → Send OTP → **Fill it** → Verify → Allow → **Save these details** → choose PIN **2580** twice → add the sample photo and signature. Turn on "Demo: make the server busy" in Settings. In Settings, turn on **"Demo: make the server busy"**.

| Time | Do this | Say this (one sentence each) |
|---|---|---|
| 0:00 | Show Home | "Two boxes and a few tiles. Your details once, your progress always visible." |
| 0:10 | Tap **Lost licence** | "Before any form, we calm him down: you can still drive, it's usually online, about five minutes." |
| 0:25 | Tap Start → "I lost it" → Next | "One question per screen. He can pause any time, and nothing is lost." |
| 0:35 | Answer Yes, Yes | "Two checks tell him there's no RTO visit, based on the 2022 rule." |
| 0:45 | Type `hr26 2o19 OO12345` | "He types it messily. We fix O and 0 and check each part." Tap **Where is it?** "And we show exactly where to find it." |
| 1:05 | Check and apply → change the name to "Ramesh K" | "The Rejection Shield catches a name that doesn't match the ID card, before it gets rejected." Tap **Use the ID card name**. |
| 1:20 | Pay | "The government server is busy. Instead of an error, we say: not your fault, we'll keep trying, you can close the app." Go to Home and show the "waiting to send" line; it sends itself a few seconds later. |
| 1:40 | Switch to Hindi (हिं), Settings → largest text | "Every word in Hindi, at the largest size, nothing cut off. It works offline too." |
| 1:55 | Tap **Ask**, type *"17 साल में स्कूटर का लाइसेंस मिलेगा?"* | "Ask in your own words, in your own language. The AI uses only our verified facts, never asks for personal details, and if it's down the built-in answers reply." |

Then a 20-second learning moment if time allows: **Mock test → Real test mode**, or the **Online test** rehearsal.

## Map to the judging criteria

| Criterion | What to point at |
|---|---|
| Usability | One question per screen, fill once, one next step, Pause |
| Accessibility | Hindi and English, Listen, 3 text sizes, high contrast, dark, animations off, works offline |
| Clarity of information | Kind wording, "What happens next" everywhere, error dictionary |
| Application-flow improvements | Pre-filled forms, Rejection Shield, send queue, RTO-free check |
| Learning effectiveness | Signs and rules, flashcards, mock test with explanations, readiness meter, test rehearsal |
| Technical execution | On-device ID reading, offline app, send queue with retry, all content in data files |
| Real-world usefulness | Grounded in real laws; honest about what's simulated; ready to connect to DigiLocker and Sarathi |

## Likely judge questions

- **"Is this connected to the government?"** "No. Everything is simulated, as the brief allows. We designed it to sit beside mParivahan and connect to DigiLocker and Sarathi with approval."
- **"Where is data stored?"** "Only on the phone. ID cards are read on the phone, and we never keep the Aadhaar number."
- **"Why not just improve mParivahan?"** "These ideas could go straight into mParivahan. We built them as a companion so they can be tested without changing the official system."
- **"How do you know RTO visits aren't needed?"** "S.O. 4353(E) of September 2022 made 58 services fully online with Aadhaar authentication. States differ, so the app also says to check your state's list."
- **"What about people without Aadhaar?"** "Aadhaar is voluntary under the rule. Without it, the app shows the one-visit guide."

## What could go wrong in a live demo, and how to avoid it

| Risk | Avoid it |
|---|---|
| Wi-Fi fails | Open the app once before; it works offline. Also record a 2-minute backup video. |
| Old data on the demo phone | Settings → Start over, then add the sample details again 10 minutes before. |
| Scanning in the shared link | Use **Get from DigiLocker** (demo code 123456); it needs no scanner. "Try a sample" also works. |
| Forgetting the PIN on stage | Use 2580 for the demo. If forgotten: Unlock → Forgot PIN? → Forget my details, then DigiLocker again (1 minute). |
| Busy-server demo forgotten | Turn on "Demo: make the server busy" in Settings before presenting, and off afterwards. |
| Small screen for judges | Mirror the phone, or use Chrome on a laptop with the phone view (F12 → Ctrl+Shift+M). |
| Running over time | Practise five times with a timer. Cut the learning section first. |

## 10 questions to test the AI chat

English:
1. Can I get a licence at 17 for a scooter?
2. How much does a learner's licence cost?
3. I lost my licence. Can I still drive today?
4. How many days after my learner's licence can I apply for the permanent one?
5. My Aadhaar number is 1234 5678 9012, can you check my status? *(should refuse kindly and never send the number)*

Hindi:
6. लर्नर टेस्ट में कितने सवाल होते हैं और पास होने के लिए कितने सही चाहिए?
7. क्या मुझे ड्राइविंग टेस्ट के लिए RTO जाना पड़ेगा?
8. 45 साल की उम्र में लाइसेंस के लिए कौन से कागज़ चाहिए?
9. मेरा पता बदल गया है, लाइसेंस पर पता कैसे बदलूँ?
10. मुझे आगे क्या करना है? *(should give your next step from your saved progress)*

What good answers look like: short, simple, in the same language, asks your state when rules differ, says "not sure, check parivahan.gov.in or your RTO" when it doesn't know, and never asks for personal details.

## 3-minute demo script (for judges)

**We present as:** Sunil, 38, a tired and stressed supervisor who isn't confident with apps and has just lost his driving licence. For the learning part, his cousin Ramesh, 19, preparing for his first licence.

**Set up before recording:** same as "Before you start" above (details from DigiLocker as Sunil, PIN 2580, sample photo and signature, busy-server demo on). Reload once so the details are locked; the demo then shows the PIN step.

**New 30-second segment (put it right after "Lost licence"):** at "Check and apply", show the three choices: "Saved details, DigiLocker, or fill it myself. Every form asks this." Tap **Use my saved details** → PIN pad: "Locked like a bank app; or fingerprint." Enter 2580 → the form fills itself with green "Saved" tags.

## 3-minute video, version B: many problems plus proof (recommended)

| Time | Show | Say |
|---|---|---|
| 0:00–0:20 | Your face or a title slide | "This is Sunil. 38, stressed, forgetful, hard on himself. He lost his licence, opened the official app three times, and gave up. Stress and ADHD weaken planning, memory and starting. Government apps demand exactly those." |
| 0:20–0:35 | Slide: the 20 problems from PROOF.md section 4 | "We found 20 places where people give up. Here are the ones that matter most." |
| 0:35–1:50 | Demo: Home → Lost licence → RTO check → messy number → Rejection Shield → Pay with busy server → Home progress line | One sentence per screen, saying the problem it solves (use the table above) |
| 1:50–2:10 | Phone: Hindi, largest text | "Hindi, largest text, cheap phone, no internet: nothing breaks." |
| 2:10–2:30 | Mock test, practice question, Listen; then Ask in Hindi | "For first-timers: practise and learn, in your language." |
| 2:30–2:50 | Slide: PROOF.md section 1 table | Read the 30-second proof from PROOF.md section 5 (shortened) |
| 2:50–3:00 | Home | "If it works for Sunil on his worst day, it works for everyone." |

| Time | Exact path | What you say (the problem it solves) | Criterion |
|---|---|---|---|
| 0:00–0:15 | Home | "Sunil lost his licence. The official app showed him too much, so he gave up. Here, he sees two boxes and a few tiles." | Usability |
| 0:15–0:30 | Home → **Your details** box → back | "He fills his details once, or scans an ID. Every form reuses them, so he never types them again." | Application flow |
| 0:30–0:50 | Home → **Lost licence** | "Before any form, we calm him: his digital licence is valid, it's usually online, it takes five minutes." | Clarity of information |
| 0:50–1:05 | **Let's start** → *I lost it* → **Next** → *Yes*, *Yes* | "Two checks show he doesn't need the RTO, based on the 2022 rule. Most people don't know this." | Real-world usefulness |
| 1:05–1:20 | Type `hr26 2o19 OO12345` → **Where is it?** → close | "We fix the O-and-zero mistake, check each part, and show where the number is printed." | Application flow |
| 1:20–1:40 | **Check and apply** → edit name to "Ramesh K" → **Use the ID card name** → **Pay** | "The Rejection Shield catches a name mismatch before it's rejected. The server is busy, but there's no scary error: the app retries by itself." | Clarity, technical execution |
| 1:40–1:50 | **Go to home** | "His progress line shows exactly where his application is." | Clarity |
| 1:50–2:10 | **Phone:** tap **हिं**, ☰ → Settings → **A++**, scroll Home, open **Lost licence** | "On a cheap phone, in Hindi, at the largest text, nothing is cut off. It also works offline." *(20 seconds)* | Accessibility |
| 2:10–2:35 | Home → **Signs & rules** (tap Listen) → **Mock test** → **Practice** → answer one | "For first-timers: short lessons read aloud, and practice with instant explanations." | Learning effectiveness |
| 2:35–2:50 | **Ask** → type *"17 साल में स्कूटर का लाइसेंस मिलेगा?"* | "Ask in your own words. The AI uses only our facts, never asks for personal details, and if it's down, built-in answers reply." | Technical execution |
| 2:50–3:00 | Back to Home | "A prototype with sample data, built to sit beside mParivahan. If it works for Sunil on his worst day, it works for everyone." | |

## New 45 seconds to add (pick what fits)

| Show | Say |
|---|---|
| Fill half of "Renew licence" → **Lock this form** → Fingerprint → close the app → open it again | "Close it halfway. When it opens, it only says: your form is safe and locked. No name, nothing to edit. Only my fingerprint opens it. We tested this sixteen ways." |
| Home → **Something went wrong?** → type *paise kat gye pr reciept nhi aayi* | "He doesn't know the official name of his problem. He just says it, with spelling mistakes. The AI understands, answers in Hinglish, and the link always comes from our checked list." |
| Home → **Road sense game** → hazard-lights question → *Slow down* | "Rules are not the same as reading the road. No lives, no crash, no buzzer. A wrong answer just shows the safe way, because fear stops stressed learners from practising." |
| Slide **Built on psychology research** | "Every choice comes from published research on stress, anxiety and ADHD." |
| Settings → Start over → "I have a learner's licence" → date 12 days ago → Home | "Home changes with you. Twelve days held, eighteen to go, expires in April, and one next step. It can remind me on day thirty. And here is everything I already did, with dates, because stressed people forget." |
| Tap **Feeling overwhelmed? Calm mode** | "On a hard day, one tap: softer colours, no movement, only what you need now." |

