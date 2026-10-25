# 3-minute demo script

**We present as Sunil, 38.** A supervisor, always under pressure, forgets things, not confident with apps, hard on himself. He has just lost his driving licence. He opened the official app three times, saw a wall of options, and closed it.

**Show it on:** a laptop with Chrome in phone view (F12 → Ctrl+Shift+M → pick a phone size), or a mirrored phone. Plus a **real phone** for the 20-second Hindi part.

---

## Set up 15 minutes before (both laptop and phone)

1. Open the live link. Go to ☰ → **Settings** → **Start over** → **Start over** again to confirm → choose **English** → **Start**.
2. Home → **Your details** → **Get from DigiLocker** → **Sunil Kumar** → **Send OTP** → **Fill it** → **Verify** → **Allow** → **Save these details**.
3. Choose PIN **2580**, enter it twice.
   - On the laptop, choose **Not now, PIN is fine**. A laptop fingerprint popup on stage is a risk.
   - On the phone you may choose **Yes, use phone lock**.
4. Laptop only: ☰ → **Settings** → turn on **Demo: make the server busy**.
5. Reload the page once, so the details are locked and the PIN step shows during the demo.
6. Phone: leave it on Home in **English** at normal text size, screen brightness up, auto-lock off, Do Not Disturb on.
7. Close every other tab. Zoom the browser to 110–125% so the room can read it.

---

## The script (exactly 3:00)

| Time | Click exactly | Say (the problem it solves) | Criterion |
|---|---|---|---|
| **0:00–0:15** | Home (just show it) | "This is Sunil. He lost his licence and gave up on the official app because it showed him everything at once. Here, Home shows one card and one next step." | Usability |
| **0:15–0:30** | Tap **Other services (lost, renew, address…)** → **Lost licence** → read the first card → **Let's start** → **I lost it** → **Next** | "Before any form, we calm him: his digital licence still counts, it's online, about five minutes. Panic is the first reason people quit." | Clarity of information |
| **0:30–0:42** | Answer **Yes**, **Yes** → **Next** | "Two questions tell him he doesn't need to visit the RTO, based on the 2022 rule. Most people don't know this and lose a day of work." | Real-world usefulness |
| **0:42–0:57** | Type `hr26 2o19 OO12345` slowly → tap **Where is it?** → close | "He types it the way people really do: small letters, O instead of zero. We fix it, check each part in green, and show where the number is printed." | Application flow |
| **0:57–1:15** | **Check and apply** → **Use my saved details** → PIN **2580** | "Every form asks one question first: saved details, DigiLocker, or fill it myself. His saved details are encrypted and locked like a bank app, so a lost phone doesn't leak them." | Application flow, technical |
| **1:15–1:35** | Change the name to `Ramesh K` → **Use a sample** (photo) → **Pay** → see the warning → **Use the ID card name** → **Pay** | "A name that doesn't match the ID is the commonest rejection. We catch it before he pays, with a one-tap fix." | Application flow, clarity |
| **1:35–1:47** | The **server busy** screen appears → **Go to home** | "The government server is busy. No error code: not your fault, nothing is lost, we keep trying, and Home shows his request is saved and waiting." | Clarity, technical |
| **1:47–2:07** | **PHONE (20 s):** tap **हिं** → ☰ → **सेटिंग्स** → **A++** → back to **होम** → scroll → tap **लाइसेंस खो गया** | "Same app, in Hindi, at the largest text size, on a budget phone. Nothing is cut off, and it works offline after the first visit." | Accessibility |
| **2:07–2:32** | Laptop: ☰ → **Mock test** → **Practice** → pick a **wrong** answer on purpose → read the explanation → **Home** → scroll to the **Road sense game** tile → **Start driving** → answer one | "For first-timers: practice with an explanation right away, no buzzer. And the road sense game teaches real situations, like hazard lights ahead, with no lives to lose, because fear stops stressed learners from practising." | Learning effectiveness |
| **2:32–2:50** | Home → **Something went wrong?** → type `paise kat gaye receipt nahi aayi` → **Find the fix** | "He doesn't know the official name for his problem. He just says it, in Hinglish with mistakes, and gets the fix and the right official link." | Real-world usefulness, technical |
| **2:50–3:00** | Back to Home | "Everything is a prototype with sample data, built to sit beside mParivahan. If it works for Sunil on his worst day, it works for everyone." | |

**Over time?** Cut the Road sense game first, then "Where is it?". **Under time?** Show **Feeling overwhelmed? Calm mode** on Home (5 s): "On a hard day, one tap: softer colours, no movement, only what you need."

### If a judge asks
- **"Is it connected to the government?"** "No, it's simulated, as the brief allows. It's designed to connect to DigiLocker and Sarathi through their official APIs."
- **"Where is my data?"** "Only on the phone, encrypted. The Aadhaar number is never stored."
- **"How do you know it works for stressed users?"** "Every design choice is linked to published research in PROOF.md, and we measured zero accessibility errors on 20 screens, including Hindi at the largest size. The next step is testing with real users at an RTO."
- **"What if the AI is wrong?"** "The AI can only pick from our checked list of problems and links. It can't invent a link. Without internet, a built-in matcher does the same."

---

## What could go wrong live, and how to avoid it

| Risk | How to avoid it | If it happens anyway |
|---|---|---|
| **Venue Wi-Fi fails** | Open the live link on the laptop and the phone before you start; the app works offline after that. Bring a phone hotspot. | Keep going: everything in the script works offline except the AI. "What happened?" still answers from the built-in list. |
| **AI is slow, rate-limited or the key is missing** | Test **Ask** and **Something went wrong?** 10 minutes before. Don't ask the AI many questions while rehearsing (free-tier limit). | It falls back on its own. Say: "Without internet or AI, built-in answers still reply." That is a feature. |
| **Old data on the demo device** | Do the setup above 15 minutes before, on both devices. | ☰ → Settings → **Start over**, then DigiLocker again (1 minute). |
| **PIN forgotten on stage** | Always use **2580** for the demo. Write it on a sticky note by the laptop. | **Forgot PIN?** → **Forget my details** → DigiLocker again. |
| **A fingerprint/Windows Hello popup on the laptop** | On the laptop choose **Not now, PIN is fine** during setup. | Cancel the popup and tap **Use PIN**. |
| **Busy-server switch left off** | Turn it on in setup step 4. | Fine: the request goes straight through to the success screen. Skip the "server busy" line. |
| **Busy request already sent before Home shows** | The queue retries every few seconds, so move to Home right away. | Home then says "Your request is sent". Say: "and it's already sent itself". |
| **Pay does nothing** | The photo is required. Tap **Use a sample** before Pay (it's in the script). | Scroll down: the missing item is marked. Tap **Use a sample**. |
| **Lost the live link or it shows a 404** | Test the link in an incognito window the day before. Bookmark it on both devices. | Run it locally: `npm.cmd run dev` → http://localhost:5173 |
| **Live link asks for a Vercel login** | Switch off **Deployment Protection** for production (see DEPLOY.md). | Use the local copy. |
| **Text too small for the room** | Zoom Chrome to 110–125%. Use the phone view, not a full desktop window. | Ctrl + plus to zoom in. |
| **Phone screen locks, notifications pop up** | Auto-lock off, Do Not Disturb on, battery above 50%. | Unlock and carry on; the app saved your place. |
| **Phone mirroring fails** | Test the mirroring (cable or Meet/Zoom screen share) before. | Hold the phone up and describe it, or do the Hindi part on the laptop. |
| **Running over 3 minutes** | Rehearse five times with a timer. | Cut the Road sense game, then "Where is it?". |
| **Projector shows colours badly** | Settings → **High contrast** is one tap away. | Mention it as an accessibility feature. |

**Backup plan for everything:** record a full run of this script as a video the day before, and keep it on the laptop desktop.

## After the demo
- Laptop: Settings → turn off **Demo: make the server busy**.
- Phone: switch back to English and normal text if you'll hand it to judges, or leave it in Hindi to show off.
