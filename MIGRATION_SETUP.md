# Migration Setup Guide (Windows → Mac)

This guide helps you get the KOS app running after migrating from your Windows PC to your MacBook.

---

## 1. Environment Variables (.env.local)

Your `.env` and `.env.local` files are not in git (they contain secrets). You need to recreate them:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and fill in your actual values. You'll need to retrieve these from:

- **Neon Database**: [neon.tech](https://neon.tech) → Your project → Connection string
- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
- **Stripe**: [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys
- **Twilio**: [Twilio Console](https://console.twilio.com)
- **ImageKit**: [ImageKit Dashboard](https://imagekit.io/dashboard)
- **Google Maps**: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
- **Resend**: [Resend](https://resend.com) → API Keys

Generate a new `AUTH_SECRET` for NextAuth:

```bash
openssl rand -base64 32
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Reconnect to GitHub

### Option A: If you have an existing GitHub repo

Initialize git and add the remote:

```bash
cd /Users/aidan/kos-app
git init
git add .
git commit -m "Initial commit after Mac migration"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kos-app.git
git push -u origin main
```

Replace `YOUR_USERNAME/kos-app` with your actual GitHub repo URL.

### Option B: If you need to create a new repo

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository (e.g., `kos-app`)
3. **Don't** initialize with README (you already have code)
4. Run the commands from Option A, using your new repo URL

### Option C: If the repo exists but you want a fresh start

If your GitHub repo has different history and you want to force-push your current state:

```bash
git init
git add .
git commit -m "Mac migration - fresh start"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kos-app.git
git push -u origin main --force
```

⚠️ **Warning**: `--force` overwrites the remote. Only do this if you're sure you don't need the old history.

---

## 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 5. Database Migrations (if needed)

If your database schema is out of sync:

```bash
npm run db:migrate:dev
```

---

## Quick Checklist

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all required env vars in `.env.local`
- [ ] Run `npm install`
- [ ] Run `git init` and connect to GitHub
- [ ] Run `npm run dev` to start the app
