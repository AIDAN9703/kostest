# Git & GitHub Setup — Step by Step (Safe Way)

Follow these steps in order. Run each command in your terminal from the project directory.

---

## Step 1: Verify you're in the right place

```bash
cd /Users/aidan/kos-app
pwd
```

You should see: `/Users/aidan/kos-app`

---

## Step 2: Check what will be committed (optional but recommended)

```bash
git status
```

If you see "not a git repository", that's expected — we'll fix that next.

---

## Step 3: Initialize a fresh git repository

```bash
git init
```

You should see: `Initialized empty Git repository in /Users/aidan/kos-app/.git/`

---

## Step 4: Check what will be committed

```bash
git status
```

Review the list. **Important:** Make sure `.env.local` is NOT listed (it should be ignored by `.gitignore`). If you see `.env.local` in the list, **stop** — it contains secrets and we need to fix `.gitignore` first.

---

## Step 5: Add all files

```bash
git add .
```

---

## Step 6: Verify what's staged (optional safety check)

```bash
git status
```

Scan the list again. No `.env`, `.env.local`, or `node_modules` should appear.

---

## Step 7: Create your first commit

```bash
git commit -m "Mac migration - fresh setup"
```

---

## Step 8: Rename branch to main (if needed)

```bash
git branch -M main
```

GitHub uses `main` as the default branch. This ensures your local branch matches.

---

## Step 9: Add your GitHub remote

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repo name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

**Example:** If your repo is `https://github.com/aidan/kos-app`, then:
```bash
git remote add origin https://github.com/aidan/kos-app.git
```

---

## Step 10: Fetch what's on GitHub (safety check)

```bash
git fetch origin
```

- If you see: `fatal: remote origin does not appear to be a git repository` — double-check your repo URL in Step 9.
- If it succeeds, you're connected.

---

## Step 11: Decide how to push

**Option A — Repo is empty or you're okay overwriting:**  
```bash
git push -u origin main
```

**Option B — Repo has commits and you want to replace them:**  
```bash
git push -u origin main --force
```

⚠️ **Warning:** `--force` overwrites the remote. Only use if you're sure you don't need the existing history on GitHub.

---

## Step 12: Verify on GitHub

1. Open your repo in a browser: `https://github.com/YOUR_USERNAME/YOUR_REPO`
2. Confirm your files are there.
3. Confirm `.env.local` is **not** in the file list.

---

## Step 13: Set up GitHub CLI auth (optional, for future pushes)

If you get authentication errors when pushing:

```bash
gh auth login
```

Follow the prompts to log in. Then try `git push` again.

---

## Quick reference — all commands in order

```bash
cd /Users/aidan/kos-app
git init
git add .
git status          # verify no .env.local
git commit -m "Mac migration - fresh setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git fetch origin
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual values.

---

## If something goes wrong

| Problem | Solution |
|---------|----------|
| "Push rejected" / "divergent histories" | Use `git push -u origin main --force` (only if you're okay overwriting) |
| "Authentication failed" | Run `gh auth login` or set up SSH keys |
| `.env.local` in staged files | Run `git reset HEAD .env.local` and add `.env.local` to `.gitignore` |
| Wrong remote URL | `git remote remove origin` then `git remote add origin <correct-url>` |
