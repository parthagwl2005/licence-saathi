# Why every detail is there, and the proof

> **Our claim:** Licence Saathi works for people under chronic stress, people with ADHD or autistic traits, and people who aren't confident with phones. Because it works for them, it works better for everyone.

We prove this in three ways:
1. **We measured it.** These are numbers anyone can re-run.
2. **We followed published standards and research.** Each design decision below names its source.
3. **We give a 10-minute test** that anyone can repeat with real people.

We are honest about the limits: this is not a clinical study, and we did not test with diagnosed users. Section 6 explains what that means and how to test properly.

---

## 1. What we measured (25 Oct 2026)

All results come from an automated browser on a 360px-wide phone screen, the size of a cheap Android phone. Each of the 20 screens was checked in three modes:
- English at normal text size
- **Hindi at the largest text size**
- high contrast

| What we checked | Result | What it should be |
|---|---|---|
| Accessibility errors (axe-core 4.10, all WCAG 2.0, 2.1 and 2.2 A/AA automated rules) | **0 errors on all 20 screens, in all 3 modes** (plus the new PIN, DigiLocker and form-chooser screens) | 0 |
| Text spilling off the screen, in Hindi at the largest size | **0 on all 20 screens** | 0 (WCAG 1.4.10 Reflow) |
| Smallest button you can tap | **36px at normal size; 45px or more at the largest size** (inline "what does this mean?" words excluded, as WCAG allows) | At least 24px (WCAG 2.5.8); Apple recommends 44pt |
| Reading text size | **16px or more for all reading text.** Small labels are 12px, and 14px or more at the largest size | 16px body text |
| **Reporting a lost licence, from Home to submitted** | **11 taps plus your 4-digit PIN. 1 thing typed** (the licence number). 2 photos. Everything else is filled in from your saved details | The usual way: type everything again in a long form |
| Choices on the lost-licence screen | **3** (Start, Pause, Back) | Fewer choices means faster, calmer decisions (Hick's law) |
| Words on the first view of "Can I apply?" | **26** | Short is easier for stressed readers (COGA: "keep text succinct") |
| Works with no internet | Yes. The whole app reloads offline after the first visit | |

> *Automated checks find only some accessibility problems. We also checked Hindi at the largest size, read-aloud and offline mode by hand. The scripts are in our test folder and can be run again.*

---

## 1b. Security test: close a half-filled form, reopen, try to get in (25 Oct 2026)

An automated browser with a **virtual fingerprint sensor** (Chrome's WebAuthn test authenticator) played both the owner and a stranger. The script is in our test folder and can be run again.

| # | What we checked | Result |
|---|---|---|
| 1 | App starts with no personal details | Passed |
| 2 | Half-filled form shows DigiLocker details | Passed |
| 3 | Before locking, the form is stored readable (no lock chosen yet) | Passed |
| 4 | Lock choice offers fingerprint/face/screen lock first | Passed |
| 5 | Phone lock registered on the device | Passed |
| 6 | After locking, NO personal detail is stored readable | Passed |
| 7 | Encrypted vault exists and contains no readable name | Passed |
| 8 | Reopened form shows "Your form is safe and locked" | Passed |
| 9 | No personal detail anywhere on the screen | Passed |
| 10 | No form fields can be edited while locked | Passed |
| 11 | "Your details" is also locked | Passed |
| 12 | A stranger without the phone lock cannot open it | Passed |
| 13 | Starting fresh shows an empty choice, nothing old | Passed |
| 14 | The locked data is untouched | Passed |
| 15 | Owner unlocks with fingerprint and continues where they stopped | Passed |
| 16 | Auto-locks after 2 minutes in the background | Passed |

**16 of 16 passed.** Honest note: *before* a lock is chosen, a half-filled form is kept readable on the phone (check 3). That's why every form shows **"Lock this form so only you can open it"**, and the Pause screen offers the same.

## 1c. The psychology behind it

| What research found | Study | What we built |
|---|---|---|
| Stress weakens the brain's planning centre (prefrontal cortex) | Arnsten, A. (2009). *Nature Reviews Neuroscience*, 10, 410–422 | One step per screen; calm first, then ask |
| Anxiety reduces attention control and processing efficiency | Eysenck, Derakshan, Santos & Calvo (2007). *Emotion*, 7(2) | Few choices, no clutter, big buttons |
| Worry and scarcity use up mental bandwidth | Mani, Mullainathan, Shafir & Zhao (2013). *Science*, 341 | Fill once, DigiLocker, numbers fixed for you |
| Uncertainty is a core driver of anxiety | Grupe & Nitschke (2013). *Nature Reviews Neuroscience*, 14 | Minutes shown, progress line, "what happens next" |
| Making a plan stops unfinished tasks from nagging the mind | Masicampo & Baumeister (2011). *Journal of Personality and Social Psychology*, 101(4) | Pause, resume exactly where you stopped, locked safely |
| "When and where" plans make follow-through much more likely | Gollwitzer & Sheeran (2006). Meta-analysis of 94 studies, *Advances in Experimental Social Psychology*, 38 | "Remind me" at a time you choose |
| ADHD: waiting for feedback is aversive (delay aversion) | Sonuga-Barke (2003). *Neuroscience & Biobehavioral Reviews*, 27 | Instant feedback in tests and in Road sense |
| Self-compassion after a mistake increases motivation to improve | Breines & Chen (2012). *Personality and Social Psychology Bulletin*, 38(9) | "Not your fault", "Not quite", no lives lost in the game |
| Practising recall beats re-reading | Roediger & Karpicke (2006). *Psychological Science*, 17(3) | Mock test, Road sense |
| Game elements give small but real learning gains | Sailer & Homner (2020). Meta-analysis, *Educational Psychology Review*, 32 | Road sense: short rounds, stars, replay |
| Extra letter spacing improves reading for people with dyslexia | Zorzi et al. (2012). *PNAS*, 109(28) | Easier reading spacing setting |
| Hazard-perception skill predicts real crash involvement | Horswill, Hill & Wetton (2015). *Accident Analysis & Prevention*, 82 | Road sense trains reading the road, not just memorising rules |
| Remembering a password is a barrier for many people | WCAG 2.2, 3.3.8 Accessible Authentication | Fingerprint, face or phone screen lock instead of a PIN |
| People judge good-looking interfaces as easier to use | Tractinsky, Katz & Ikar (2000). *Interacting with Computers*, 13 | Calm, premium visual design |

*These studies support the design direction. They are not a test of this app with real users; that is our next step (section 6).*

---

## 2. Why stress and ADHD break government apps

| What happens in the brain | What it looks like in real life (Sunil) | What usually makes it worse |
|---|---|---|
| **Stress weakens the brain's "planning" part** (prefrontal cortex), so people stop planning and start avoiding. *(Arnsten, Nature Reviews Neuroscience, 2009)* | He reads the same line three times and can't decide | 20 links on one screen |
| **Worry uses up mental space**, like background apps draining a phone battery. *(Mullainathan & Shafir, "Scarcity", 2013; Mani et al., Science, 2013)* | He forgets what he was doing when the phone rings | Long forms that need memory |
| **ADHD is a problem with executive function:** starting, remembering, judging time and finishing. Help must be "at the point of performance", on the screen exactly when it's needed. *(Barkley)* | He opens the app, sees a long task, and closes it to "do later" | Unknown length, no saving, no reminder |
| **Autistic traits** call for things that are predictable, literal and low in sensory load. *(UK Home Office accessibility posters, 2016)* | Idioms, flashing and surprise pop-ups upset him | Inconsistent layouts, vague words |
| **Shame leads to avoidance.** Blame increases giving up; kindness to oneself helps people try again. *(Neff, 2003)* | "Invalid input!" makes him feel stupid | Red errors, words like "penalty" and "rejected" |
| **Stress is a temporary disability everyone gets.** *(Microsoft Inclusive Design: permanent, temporary and situational)* Solving for the extreme helps everyone *(the "curb-cut effect", Blackwell, 2017)* | A healthy person, tired after a 12-hour shift, behaves the same way | Designing only for the calm, ideal user |

About 2.6% of adults worldwide have persistent ADHD, and about 6.8% have symptoms *(Song et al., Journal of Global Health, 2021)*. In India that is tens of millions of drivers. Stress affects nearly everyone at some point.

---

## 3. Every small decision, and why

**How to read this table:** *Problem* is what goes wrong without the decision. *Evidence* is the research or standard behind it. *Where* is how to see it in the app.

### Starting (the hardest part for ADHD)
| Decision | Problem | Evidence | Where |
|---|---|---|---|
| Home shows only **two boxes and a few tiles** | A screen full of links causes "choice freeze" | Hick's law (more choices means slower decisions); COGA Objective 5, "Help users focus" | Home |
| **One next step**, with a time estimate ("about 5 minutes") | People with ADHD struggle to judge time; an unknown task feels endless | Barkley: make time visible; COGA Objective 3 | Home → next-step card |
| The lost-licence screen **calms first, then asks** ("You can still drive. Usually no RTO visit. About 5 minutes.") | Panic blocks reading | Arnsten 2009: lower the threat first, then the thinking brain works | Lost licence |
| **One question per screen** | Long forms overload working memory | GOV.UK Design System, "one thing per page"; Sweller's cognitive load theory (1988) | Lost licence, Eligibility |
| **Language chosen first**, in both scripts, before anything else | Someone who can't read the first screen leaves | COGA Objective 1 | First screen |

### Filling in (where people make mistakes)
| Decision | Problem | Evidence | Where |
|---|---|---|---|
| **Fill details once**, reused in every form | Typing again causes mistakes and drop-off | **WCAG 2.2 3.3.7 Redundant Entry** (Level A); COGA Objective 6, "Don't rely on memory" | Your details, then every form |
| **Scan your ID**, then "Is this right?" | Typing is slow; the scan can misread | Nielsen heuristic: recognition over recall; the person always confirms | Your details → Scan |
| **Licence number fixed as you type** (O→0, spaces, small letters) | One wrong character means rejection weeks later | Postel's law (accept messy input, store it cleanly); WCAG 3.3.3 Error Suggestion | Lost → licence number |
| Number shown in **groups** ("HR26 2019 0012345") | A 15-character string is impossible to check by eye | Working memory holds about 4 chunks *(Cowan, 2001)* | Same field |
| **"Where is it?" picture** of the card | "Find your DL number" means nothing if you've never noticed it | COGA Objective 1; Barkley: help at the point of performance | Same field |
| **Rejection Shield**: name must match the ID card | A name spelt differently from the ID is a common reason applications are sent back, often weeks later | WCAG 3.3.4 Error Prevention; Nielsen heuristic: error prevention | Check and apply |
| **"Save this change to your profile?"** | A fix in one form is lost for the next one | WCAG 3.3.7 | After editing a form |
| **Review before paying**, and tap any line to change it | Money anxiety; fear of a mistake you can't undo | WCAG 3.3.4 (financial: reviewable before submit) | Check and apply |

### When things go wrong
| Decision | Problem | Evidence | Where |
|---|---|---|---|
| "Server busy" says **"Not your fault. Nothing is lost. We keep trying."** | The usual error causes panic, retries and double payments | Neff 2003 (blame-free wording); GOV.UK error messages: don't blame the user | Settings → "Demo: make the server busy", then apply |
| **Send queue**: it retries by itself and you can close the app | People sit refreshing, or give up | Nielsen heuristic 1, "Visibility of system status" | Home: "waiting to send" |
| **Error dictionary**: what happened, whose fault, one fix | Codes like "ERR_502" mean nothing | WCAG 3.3.1 Error Identification; COGA Objective 4 | Help and safety |
| **We write the complaint for you** | Writing a formal complaint is a huge barrier | COGA Objective 7, "Provide help and support" | Help and safety → a problem |
| No words like "invalid", "penalty" or "failed" | Harsh self-talk gets triggered, then avoidance | Neff 2003; UK Home Office posters (plain language) | Everywhere ("Not quite" in the mock test) |

### Memory and time
| Decision | Problem | Evidence | Where |
|---|---|---|---|
| **Auto-save on every tap** | Interruptions (phone call, power cut) wipe out progress | COGA Objective 6; WCAG 2.2.6 Timeouts (no data lost) | Leave and come back |
| **Pause** button: "Everything is saved", plus **Remind me** | People leave and never come back | Implementation intentions: deciding *when* you'll do it makes follow-through much more likely *(Gollwitzer, 1999; meta-analysis of 94 studies, Gollwitzer & Sheeran, 2006)* | Pause → Remind me (calendar file) |
| **Progress line** on Home | A long process feels never-ending | Goal-gradient effect: people speed up when they see they're close *(Kivetz et al., 2006)* | Home status box |
| **No time limits** on forms; practice test untimed | Time pressure overwhelms ADHD and slow readers | WCAG 2.2.1 Timing Adjustable | Mock test → Practice |
| The timed test is **optional** and copies the real one | Surprise on the real test day | Rehearsal reduces anxiety about the unknown | Mock test → Real test mode |
| **Download a summary** (picture) | "What did I apply for? Where's my number?" | Barkley: put memory outside the head | Home → Download summary |
| **Continue on another device** with a code | Started on a son's phone, can't continue on his own | COGA Objective 6 | Settings |

### Reading and understanding
| Decision | Problem | Evidence | Where |
|---|---|---|---|
| **Class 8 words**, short sentences | Legal language blocks people with low literacy | WCAG 3.1.5 Reading Level; COGA, "Use clear words" | Everywhere |
| Hard words (RTO, LL) have **"What does this mean?"** | Jargon makes people feel left out | WCAG 3.1.3 Unusual Words / 3.1.4 Abbreviations | Apply, Permanent |
| **Helper line in the other language** | A Hindi reader may know the English term, or the reverse | WCAG 3.1.2 Language of Parts (tagged for screen readers) | Under every heading |
| **Listen** (read aloud) | Some people read slowly; some can't read at all | Mayer's modality principle; dual coding *(Paivio)* | Lessons, service pages |
| **"People often get stuck here"** tips | The same trap catches everyone | COGA Objective 7 | Hard steps |

### Senses, body and phone
| Decision | Problem | Evidence | Where |
|---|---|---|---|
| **3 text sizes**, with nothing cut off at the largest | Older eyes, cracked screens | WCAG 1.4.4 Resize Text, 1.4.10 Reflow (measured: 0 overflow) | Settings |
| **High contrast** mode and warm, low-glare colours | Reading in sunlight; low vision | WCAG 1.4.3 Contrast (measured: 0 errors) | Settings |
| **Animations off** switch | Motion distracts people with ADHD and upsets some autistic users | WCAG 2.3.3; Home Office autism poster. The app also follows the phone's own "reduce motion" setting | Settings |
| **Big buttons** (36–55px) | Shaky hands, thumbs, small phones | WCAG 2.5.8 (measured) | Everywhere |
| **Works offline**, light app | Weak network, cheap phones, prepaid data | Installable web app | Turn off the internet and reload |

### Trust and privacy
| Decision | Problem | Evidence | Where |
|---|---|---|---|
| The app **starts blank**; nothing is known until you choose to save it | People don't want an app that "already knows" them | Data minimisation and consent (DPDP Act 2023 principles) | First open |
| Every form first asks **"How do you want to fill this form?"**: saved details, DigiLocker, or fill it myself | Some people don't want saved details used; some forms are for someone else | COGA Objective 8 (adaptation and personal choice); user control and freedom (Nielsen) | Any Apply screen |
| Saved details **encrypted on the phone** (AES-256-GCM) and opened only with a **4-digit PIN** | A shared or lost phone exposes Aadhaar, address and photos | Same pattern as bank apps' MPIN; a wrong PIN simply cannot decrypt them | Save details → choose a PIN |
| Or open them with the **phone's own lock** (fingerprint, face, phone PIN) | Remembering another PIN is hard for ADHD and memory problems | **WCAG 2.2 3.3.8 Accessible Authentication**: a memory test must have an alternative; the phone's biometric lock (WebAuthn) is that alternative | Settings → Use phone screen lock |
| Wrong PINs slow down (5 tries, then 30 s, doubling); **locks itself after 2 minutes** in the background; **Forget my details** any time | Guessing attacks; a phone left on a counter; wanting a clean start | Banking app practice | Settings → Lock and privacy |
| **DigiLocker** (demo): OTP, tick what to share, the form fills itself, every number is checked (Aadhaar checksum, licence format, PIN code) | Typing from documents is where mistakes happen | WCAG 3.3.7 Redundant Entry; COGA Objective 6 "Don't rely on memory" | Any form → Get from DigiLocker |
| ID read **on the phone**; the Aadhaar number is **never saved** (only the last 4 digits are shown) | Fear of data misuse stops people from using it | Data minimisation (India's DPDP Act 2023 principle) | Your details, DigiLocker |
| AI **won't take Aadhaar numbers** and answers only from our checked facts | Made-up AI answers; data leaks | Numbers are removed before anything is sent | Ask → type a 12-digit number |
| **"(simulated)"** shown on payments and sample data | Misleading people loses trust | Honesty | Pay button |
| **"Do I need the RTO?"** based on the law | Agents and wasted days off work | S.O. 4353(E), 16 Sept 2022; GSR 394(E), 2021 | Do I need the RTO? |

### New: lock, "What happened?" and Road sense
| Decision | Problem | Evidence | Where |
|---|---|---|---|
| Lock with **fingerprint, face or phone screen lock** first; PIN only as a backup | A PIN is one more thing to remember | WCAG 2.2 3.3.8 Accessible Authentication | Lock this form → Fingerprint, face or phone screen lock |
| Reopened half-filled form shows **only "Your form is safe and locked"** | A shared phone exposes a half-filled application | Tested: 16/16 checks (section 1b) | Close the app halfway, open the form again |
| **"What happened?"** accepts Hindi, English, Hinglish and typos | Stressed people don't know the official name of their problem | Attentional control theory (Eysenck et al., 2007): less effort to describe means less overload | Home → Something went wrong? |
| The AI only **chooses** from our checked list; pages and links come from that list | AI can invent fees, laws or fake websites | Safety by design; numbers removed before sending | Same screen |
| **Road sense**: no lives, no crashes, no buzzer | Fear of failing stops stressed learners from practising | Self-compassion (Breines & Chen, 2012); delay aversion in ADHD (Sonuga-Barke, 2003) | Home → Road sense game |
| Optional **10-second challenge**, off by default | Timers overwhelm anxious people, but some want a challenge | WCAG 2.2.1 Timing Adjustable | Road sense → Challenge switch |
| **Home changes with your situation** (LL applied, holding LL, DL applied, test booked, passed, lost licence), each in its own soft colour | People don't know what to do next | Help "at the point of performance" (Barkley); uncertainty drives anxiety (Grupe & Nitschke, 2013) | Home, top card |
| Holding a learner's licence: **days held, countdown to day 30, expiry date and days left** | Time blindness: "can I apply yet?" | Barkley: make time visible | Home, top card |
| **One next step right under the headline** | The action gets lost below the facts | Hick's law; COGA Objective 5 "Help users focus" | Home, top card |
| **Remind me on day 30 / 15 days before expiry** (calendar file) | Forgetting the window and the LL expiring | Implementation intentions (Gollwitzer & Sheeran, 2006) | Home, top card |
| **"What you've already done"**, with dates | People forget what they did and redo or panic | COGA Objective 6 "Don't rely on memory" | Home, below the boxes |
| **Calm mode**: softer colours, no movement, only what you need now | Sensory overload on a hard day | Home Office autism poster; WCAG 2.3.3 | Home → "Feeling overwhelmed? Calm mode", or Settings |
| **Easier reading spacing** | Crowded text is hard for dyslexic and tired readers | Extra letter spacing improves reading in dyslexia (Zorzi et al., 2012, *PNAS*); WCAG 1.4.12 Text Spacing | Settings |
| **"about N min left"** on every form | Not knowing how long it will take | Time-blindness mitigation (Barkley) | Every form |
| **"Save and go home"** escape on every form | Feeling trapped in a flow raises anxiety | Trauma-informed design: user control and choice | Pause, on every form |

### Learning (for first-timers like Ramesh)
| Decision | Problem | Evidence | Where |
|---|---|---|---|
| **Practice questions** with instant explanations | Reading rules doesn't stick | Testing effect: practising recall beats re-reading *(Roediger & Karpicke, 2006)* | Mock test → Practice |
| **Your mistakes** reviewed at the end | The same mistakes get repeated | Feedback is one of the strongest influences on learning *(Hattie & Timperley, 2007)* | Mock test → results |
| **Readiness meter** (last 3 tests) | "Am I ready?" anxiety; booking too early, then failing | Visible progress (goal-gradient) | Home, Mock test |
| **Signs as pictures**, with words and sound | Words alone are hard to remember | Dual coding *(Paivio)* | Signs and rules |
| **Test-day and driving-test rehearsal** (what examiners check, common mistakes) | Fear of the unknown on test day | Lower uncertainty, lower anxiety | Test day, Driving test |

---

## 4. Problems we solve (the full list: 20)

1. **Too much on screen, so people freeze.** We show one question per screen, 2–3 choices and one next step.
2. **Typing the same details again.** We fill them in once (or scan an ID) and reuse them everywhere.
3. **Long numbers typed wrong.** The number is fixed as you type, shown in groups, with a picture of where to find it.
4. **Rejected weeks later for a name mismatch.** The Rejection Shield catches it before you pay.
5. **Not knowing the RTO isn't needed.** A legal check, in two questions.
6. **Panic after losing a licence.** The first screen calms you: your digital licence is valid.
7. **Busy server or failed payment.** "Not your fault"; it retries by itself, and you can close the app.
8. **Leaving halfway and forgetting.** Auto-save, Pause, a calendar reminder and a status box.
9. **Not knowing what's next, or how long it takes.** One next step, with minutes shown.
10. **Not knowing where the application is.** A progress line and a tracker.
11. **Scary or legal words.** Plain words, a "What does this mean?" button and kind error messages.
12. **Language and reading.** Hindi and English, a helper line, read-aloud and Class 8 words.
13. **Cheap phones, sunlight, weak eyes, no internet.** 3 text sizes, high contrast, works offline.
14. **Failing the learner's test.** Lessons, practice, a mistakes review and a readiness meter.
15. **Fear of test day.** A rehearsal of what happens, and the mistakes examiners look for.
16. **No one to ask.** Ask in your own words, in your language, and the app writes your complaint.
17. **Privacy fear.** The app starts blank; saved details are encrypted and open only with your PIN or your phone's lock; the Aadhaar number is never stored.
18. **Typing from documents.** DigiLocker fills the form and checks every number; or fill it yourself, your choice on every form.
19. **Not knowing what went wrong, or its official name.** "What happened?": say it your way in Hindi, English or Hinglish, typos fine. AI (or the offline matcher) finds the problem, the fix, the right page and the official link.
20. **Knowing the rules but not reading the road.** Road sense: you drive, something happens (red light, indicator, hazard lights, ambulance, U-turn), you choose. No lives, no crashes, kind feedback.

---

## 5. 30-second "proof" for the video

> "We didn't just say it's accessible, we measured it. Zero accessibility errors on all 20 screens, in Hindi at the largest text size, on a cheap-phone screen. Reporting a lost licence takes 11 taps and your PIN, with one typed number. And our security test passes 16 of 16 checks: close a form halfway, reopen it, and nobody without your fingerprint can see or change it. And every small choice, from fill-once to 'not your fault' to the reminder button, comes from published research on stress and ADHD and from the WCAG 2.2 and W3C cognitive-accessibility guidelines. The full table is in PROOF.md."

---

## 6. What we have not proven yet, and how to

- We did **not** run a study with people diagnosed with ADHD or autism. The design follows the published guidance written with those communities (W3C COGA), and our automated checks pass.
- **A 10-minute test anyone can repeat** (with 2–3 people, for example a parent or a neighbour):
  1. Task: *"You lost your licence. Apply for a new one."* Use Licence Saathi with sample details.
  2. Write down: the time taken, the number of times they got stuck or asked for help, and whether they finished.
  3. Ask: *"How easy was that, from 1 (very hard) to 7 (very easy)?"* (the Single Ease Question), and *"How stressed did you feel, from 1 to 5?"*
  4. Optional: ask them to find the same service on the official app and compare.
- **Next:** test with 10 or more people at an RTO or a cyber café, including people who say they find forms stressful. Repeat in Hindi.

## Sources
- W3C, *Making Content Usable for People with Cognitive and Learning Disabilities* (COGA), 2021: https://www.w3.org/TR/coga-usable/
- W3C, *Web Content Accessibility Guidelines (WCAG) 2.2*, 2023: https://www.w3.org/TR/WCAG22/
- UK Home Office, *Dos and don'ts on designing for accessibility* (posters), 2016: https://ukhomeoffice.github.io/accessibility-posters/
- GOV.UK Design System and Service Manual: "one thing per page" and error-message guidance
- Arnsten, A. (2009). Stress signalling pathways that impair prefrontal cortex structure and function. *Nature Reviews Neuroscience*.
- Mani, A., Mullainathan, S., Shafir, E., Zhao, J. (2013). Poverty impedes cognitive function. *Science*.
- Barkley, R. A. Executive functions and ADHD ("point of performance").
- Cowan, N. (2001). The magical number 4 in short-term memory. *Behavioral and Brain Sciences*.
- Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science*.
- Gollwitzer, P. (1999); Gollwitzer & Sheeran (2006). Implementation intentions.
- Kivetz, Urminsky, Zheng (2006). The goal-gradient hypothesis resurrected. *Journal of Marketing Research*.
- Roediger & Karpicke (2006). Test-enhanced learning. *Psychological Science*.
- Neff, K. (2003). Self-compassion. *Self and Identity*.
- Song, P. et al. (2021). Prevalence of adult ADHD. *Journal of Global Health*.
- Microsoft Inclusive Design Toolkit (2016); Blackwell, A. G. (2017). The curb-cut effect. *Stanford Social Innovation Review*.
- Nielsen, J. (1994). 10 usability heuristics.
- Hattie, J. & Timperley, H. (2007). The power of feedback. *Review of Educational Research*.
