# Get Right — She's Right Health Advocacy App

## Stack
- Single `index.html` frontend (all pages, styles, canvas animations)
- 2 Netlify serverless functions (`translate.js` for Claude AI, `speak.js` for ElevenLabs voice)
- Deployed on Netlify (no build step needed)

## Project Structure
```
getright/
├── index.html                    ← entire frontend
├── netlify.toml                  ← Netlify config
├── README.md
└── netlify/functions/
    ├── translate.js              ← Claude API (AI Guide, The Nook, Bias Translator)
    └── speak.js                  ← ElevenLabs TTS voice
```

## Deploy to Netlify

### First time
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Deploy manually**
3. Drag the entire `getright/` folder onto the drop zone
4. Your site deploys instantly

### Set environment variables (required for AI + Voice)
1. Netlify → your site → **Site configuration** → **Environment variables**
2. Add:
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
   - `ELEVENLABS_API_KEY` — from [elevenlabs.io](https://elevenlabs.io)
3. **Redeploy** after adding variables (Deploys → Trigger deploy)

### Subsequent deploys
- **Manual**: Drag the `getright/` folder again to the Deploys tab
- **Auto**: Connect to GitHub repo → every push to `main` auto-deploys

## Connect to GitHub (recommended for team)
1. Create a GitHub repo named `getright`
2. Push this folder to it
3. Netlify → Site configuration → **Link to Git provider** → choose your repo
4. Set publish directory: `.` (root), no build command
5. Team members can now clone, branch, and open PRs

## AI Models
- Claude: `claude-sonnet-4-5`
- ElevenLabs: `eleven_turbo_v2`, Voice ID: `qkmInDL6rZEVxAN2Tmwh`

## Pages
| Page | ID | Description |
|------|----|-------------|
| Home | `home` | Landing with mission stats |
| My Health | `myhealth` | Body Garden canvas + check-in + diary |
| Bias Translator | `translator` | Symptom → clinical language (Claude powered) |
| Apothecary | `apothecary` | Herb shelves, conditions library, astrology |
| My Circle | `circle` | Anonymous Sister Circle + Provider Directory |
| Prepare | `prepare` | Appointment Armor + Breathing Practice |
| The Nook | `backroom` | Auntie's immersive room + full AI chat |

## What's next (backlog)
- [ ] Supabase auth + data sync (replace localStorage)
- [ ] Intake survey / onboarding flow
- [ ] Mobile layout polish
- [ ] Whisper voice input for better mobile accuracy
- [ ] ElevenLabs upgrade for original voice
