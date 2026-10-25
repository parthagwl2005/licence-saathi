# Put Licence Saathi online (GitHub → Vercel or Netlify)

About 15 minutes. You need a free account on GitHub and on **one** of Vercel or Netlify. Vercel is recommended: it's slightly simpler.

Already set up in this folder, so you don't need to change any code:
- `vercel.json` and `netlify.toml` hold the build settings and the **refresh-without-404 rule**.
- `api/chat.js` (Vercel) and `netlify/functions/chat.js` (Netlify) hold the AI endpoint.
- `.gitignore` keeps `.env` (your key), `node_modules` and `dist` off GitHub.

---

## Part 1: Put the code on GitHub

### Option A: GitHub Desktop (easiest, no commands)
1. Install **GitHub Desktop** from desktop.github.com and sign in with your GitHub account.
2. **File → Add local repository…** → choose the `licence-saathi` folder.
   It will say "This directory does not appear to be a Git repository". Click **create a repository** → **Create repository**.
3. Look at the list of changed files on the left. **`.env` must NOT be in the list**, and neither should `node_modules`. If `.env` appears, stop: the `.gitignore` file is missing from the folder.
4. Bottom left, write a summary such as `Licence Saathi hackathon submission` → **Commit to main**.
5. Click **Publish repository** at the top.
   - Name: `licence-saathi`
   - **Untick "Keep this code private"** if the judges need to see the code. Otherwise keep it private and add them later.
   - Click **Publish repository**.
6. Open github.com/your-username/licence-saathi to check the files are there and the README shows below them.

### Option B: Commands (VS Code terminal)
First create an **empty** repository on github.com: **+ → New repository** → name `licence-saathi` → Public → **don't** tick "Add a README" → **Create repository**. Then in the VS Code terminal, inside the project folder:

```bash
git init
git add .
git status            # check: .env and node_modules must NOT be listed
git commit -m "Licence Saathi hackathon submission"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/licence-saathi.git
git push -u origin main
```

- Git not installed? Get it from git-scm.com, then close and reopen VS Code.
- Git asks who you are? Run `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`, then commit again.
- A sign-in window appears on push: sign in with GitHub in the browser.

### Later changes
GitHub Desktop: write a summary → **Commit** → **Push origin**. With commands: `git add .`, `git commit -m "what changed"`, `git push`. Vercel and Netlify redeploy by themselves within about a minute.

---

## Part 2a: Vercel (recommended)

1. Go to **vercel.com** → **Sign Up** → **Continue with GitHub**.
2. **Add New… → Project** → find `licence-saathi` → **Import**.
   If it's not listed, click **Adjust GitHub App Permissions** and allow that repository.
3. Settings on the import screen (most are filled in from `vercel.json`):
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Open **Environment Variables** on the same screen:
   - Key: `GEMINI_API_KEY`
   - Value: your key from aistudio.google.com/apikey
   - Click **Add**
5. Click **Deploy**. After about a minute you get a link like `https://licence-saathi.vercel.app`.
6. **Make sure judges can open it.** Open the link in a private (incognito) window.
   - If it asks for a Vercel login, go to **Project → Settings → Deployment Protection** and switch off **Vercel Authentication** for production.
   - Always share the main `.vercel.app` link, not the long one with random letters.

**Refresh setting (stops 404 on refresh).** It's already in `vercel.json`:
```json
"rewrites": [{ "source": "/((?!api/|assets/|ocr/).*)", "destination": "/index.html" }]
```
This sends every page address to the app, but leaves the AI endpoint and files alone. The app also uses `/#/` links (for example `/#/lost`), so a refresh always loads the app anyway. This rule is a second safety net.

**Added or changed the key after deploying?** Go to **Deployments → ⋯ on the latest → Redeploy**. Environment variables only apply to new deployments.

## Part 2b: Netlify (alternative)

1. Go to **netlify.com** → **Sign up** → **GitHub**.
2. **Add new site → Import an existing project → GitHub** → pick `licence-saathi`.
3. The build settings come from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions: `netlify/functions`
4. Click **Add environment variables** (or after deploying: **Site configuration → Environment variables**):
   - Key: `GEMINI_API_KEY`
   - Value: your key
5. Click **Deploy**. To get a nicer link, go to **Site configuration → Change site name** and use `licence-saathi`, giving `https://licence-saathi.netlify.app`.
6. Added the key after deploying? Go to **Deploys → Trigger deploy → Deploy site**.

**Refresh setting (stops 404 on refresh).** It's already in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
Real files and the `/api/chat` function are still served first; we tested this. If you ever remove `netlify.toml`, the same rule can live in a file `public/_redirects` with the single line `/* /index.html 200`.

---

## Part 3: Check the live link (5 minutes, on your phone)

| Check | How | Good result |
|---|---|---|
| Opens for strangers | Private/incognito window | App opens, no login |
| Refresh works | Open Lost licence, then pull down to refresh | Same screen, no 404 |
| AI works | **Ask** → "Can I get a licence at 17 for a scooter?" | Small **"AI answer"** tag |
| AI fallback works | (Nothing to do) | Without a key, the answer says "Quick answer from our saved list", which is still fine |
| What happened? | Home → **Something went wrong?** → *paise kat gaye receipt nahi aayi* | Payment fix with the official link |
| Fingerprint lock | Your details → DigiLocker → Save → **Yes, use phone lock** | The phone's own fingerprint or face prompt (needs the https link, which you now have) |
| Offline | Open once, turn on airplane mode, reopen | App still opens |
| Hindi, largest text | **हिं**, then ☰ → सेटिंग्स → **A++** | Nothing cut off |

If the AI says "Quick answer from our saved list" but you added a key: in Vercel open **Logs** (in Netlify, **Logs → Functions**) and look for `[api/chat] 503 no_key` (the key is missing, so redeploy) or `401 bad_key` (the key is wrong).

## What to submit
- **Live link:** your `.vercel.app` or `.netlify.app` address
- **Code:** `https://github.com/YOUR-USERNAME/licence-saathi`
- **Pitch deck:** `Licence-Saathi-Pitch.pdf` (in this folder)
- **Description:** text from `SUBMISSION.md`
- **Demo video:** your recording (see `DEMO.md`)
- **Note for judges:** "Demo PIN 2580 · DigiLocker demo OTP 123456 · best on a phone"

## Safety
- Never paste the key into any file in `src/`. It only goes in `.env` (your computer) or the Vercel/Netlify settings.
- The key you pasted into a chat earlier should be deleted in AI Studio once your new one works. After the hackathon, delete the new one too, or limit it in Google Cloud.
