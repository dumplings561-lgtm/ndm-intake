# Night & Day Medical — Patient Intake Portal v2

## Setup

### 1. Install
```bash
npm install
```

### 2. Create Resend account (FREE — 2 min)
1. Go to https://resend.com → Sign up
2. Go to API Keys → Create key → Copy it

### 3. Set Vercel environment variables
In Vercel → Project → Settings → Environment Variables, add:
- `RESEND_API_KEY` = your Resend API key
- `NOTIFY_EMAILS` = `anthonysantoiemma561@gmail.com` (comma-separated for multiple)
- `RESEND_FROM_EMAIL` = `Night & Day Medical <intake@resend.dev>`

### 4. Push and deploy
```bash
git add .
git commit -m "v2: PDF intake packet + formatted email"
git push
```
Vercel auto-deploys.

## How It Works
1. Patient fills out 8-step intake
2. On payment → `/api/submit-intake` generates 3-page PDF + sends formatted email
3. Patient redirected to Stripe for $299 payment
4. You receive: HTML email with clinical layout + PDF attachment
5. Email subject: `Santoiemma, Anthony — DOB: 02/09/1990 — New Patient Intake`
6. PDF filename: `NDM_Intake_Santoiemma_Anthony_2026-02-10.pdf`
