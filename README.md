# Night & Day Medical — Patient Intake Portal

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `pages/index.js` and replace the two config values at the top:

```js
var FORMSPREE_URL = "https://formspree.io/f/YOUR_FORM_ID";
var STRIPE_PAYMENT_LINK = "https://buy.stripe.com/YOUR_LINK";
```

**Formspree setup:**
1. Go to https://formspree.io → Sign up (free)
2. Create a new form → set notification email to your email
3. Copy the form endpoint URL

**Stripe Payment Link setup:**
1. Go to https://dashboard.stripe.com → Payment Links
2. Click "+ New" → Add product "Initial Consultation & Lab Work" → $299 one-time
3. Create → Copy the payment link URL

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 4. Deploy to Vercel
```bash
# Push to GitHub first
git init
git add .
git commit -m "NDM intake portal"
git remote add origin https://github.com/YOUR_USERNAME/ndm-intake.git
git push -u origin main

# Then go to vercel.com → Import from GitHub → Select ndm-intake → Deploy
```

## Flow
1. Welcome → 2. Basic Info → 3. Symptoms → 4. Medical History → 5. TMA Agreement → 6. Payment (Stripe) → 7. ID Upload → 8. Confirmation

## What happens on submission
- All medical/intake data is emailed to you via Formspree
- Client is redirected to Stripe Payment Link for $299
- Client uploads ID and sees next steps (labs, physical, consult)
