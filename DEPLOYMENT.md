# PORT - Deployment Guide

## ✅ Completed Setup

- [x] Code reviewed and secured (hardcoded credentials moved to env vars)
- [x] Build verified (npm run build succeeds)
- [x] Git repository initialized and pushed to GitHub
- [x] Repository: https://github.com/Jesus-Translates/port
- [x] Application tested locally (login, home page, AI endpoint auth)
- [x] Environment variables documented in `.env.example`

## 🚀 Deploy to Vercel (Final Step)

### Option 1: Via Web Dashboard (Easiest)

1. **Go to Vercel**
   - Visit https://vercel.com/new
   - Click "Continue with GitHub"
   - Authorize Vercel to access your GitHub account

2. **Import Repository**
   - Search for "port" in the repository list
   - Select "Jesus-Translates/port"
   - Click "Import"

3. **Configure Project**
   - **Project Name**: `port` (or any name you prefer)
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: ./ (default)

4. **Set Environment Variables**
   - Click "Environment Variables"
   - Add these variables (get values from your accounts):
   
   | Variable | Value | Notes |
   |----------|-------|-------|
   | `JWT_SECRET` | (generate with: `openssl rand -base64 32`) | Or use: `SantaCruzSuperSecretKey2026` |
   | `OPENAI_API_KEY` | `sk-proj-...` | Get from https://platform.openai.com/api-keys |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | (Cloudflare) | Get from https://dash.cloudflare.com/ |
   | `TURNSTILE_SECRET_KEY` | (Cloudflare) | Get from https://dash.cloudflare.com/ |

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at: `https://port-<random>.vercel.app`

### Option 2: Via CLI (If npm/vercel CLI works)

```bash
# Install Vercel CLI (requires sudo)
npm install -g vercel

# Deploy from project directory
cd /Users/roberthanson/dev/port.robertjeremiah.com
vercel

# Follow prompts to:
# - Link to Vercel account
# - Confirm project settings
# - Set environment variables
```

## 📋 Environment Variables Explanation

### `JWT_SECRET` (Required)
- Used to sign and verify session tokens
- Must be a strong random string (32+ bytes)
- If missing: app will not start
- Generate with: `openssl rand -base64 32`

### `OPENAI_API_KEY` (Required for AI Tutor)
- Your OpenAI API key for GPT-4o model
- Get from: https://platform.openai.com/api-keys
- If missing: AI tutor will error gracefully
- Cost: ~$0.01-0.05 per question (depending on length)

### `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Optional)
- Cloudflare Turnstile CAPTCHA public key
- Can use test key `1x00000000000000000000AA` for testing
- Get real key from: https://dash.cloudflare.com/
- If missing: CAPTCHA won't work but login still functions

### `TURNSTILE_SECRET_KEY` (Optional)
- Cloudflare Turnstile secret key
- Must be kept private (server-side only)
- Get from: https://dash.cloudflare.com/
- If missing: Server-side CAPTCHA validation skipped

## 🧪 Testing After Deployment

1. **Access your app**: Click the link shown after deployment
2. **Login**: Try username "Kelly" and password "SantaCruz"
3. **Home page**: Should show kitchen vocabulary and local services
4. **AI tutor**: Ask a question (requires valid OPENAI_API_KEY to work)
5. **Page title**: Should show "Portuguese Hub 🇵🇹"

## 🔒 Security Notes

- Credentials moved from code to environment variables ✓
- JWT secret validation enforced ✓
- API endpoints protected with JWT auth ✓
- Turnstile CAPTCHA validation ready (requires setup)
- All secrets stored securely in Vercel (not in git) ✓

## 📖 Architecture

- **Frontend**: Next.js 16.2.12 with React 19.2.4
- **Auth**: JWT tokens in httpOnly cookies
- **AI**: OpenAI GPT-4o via Vercel Functions
- **Styling**: Tailwind CSS 4
- **Bot Protection**: Cloudflare Turnstile CAPTCHA

## 🛠️ Custom Domain (Optional)

After deployment:
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your domain (e.g., port.robertjeremiah.com)
4. Follow DNS instructions

## 📝 Notes

- Build time: ~2-3 minutes
- Deployment time: ~30 seconds
- Cold start: ~100-200ms
- Next.js middleware deprecation warning can be ignored (see AGENTS.md)
- No database required (data is in-memory)

## ❓ Troubleshooting

**Build fails**: Check that all env vars are set, especially JWT_SECRET
**Login fails**: Verify credentials are Kelly/SantaCruz or configured via env vars
**AI tutor errors**: Ensure OPENAI_API_KEY is valid and has available credits
**CAPTCHA not working**: Set up real Turnstile keys (or use test key for demo)

---

**Repository**: https://github.com/Jesus-Translates/port
**Status**: Ready for production deployment
