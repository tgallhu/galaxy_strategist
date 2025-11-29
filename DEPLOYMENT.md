# 🚀 Deployment Guide - Galactic Strategist

Complete guide to deploy your game to the web using GitHub and Firebase Hosting.

## Overview

This guide will help you:
1. ✅ Set up GitHub repository
2. ✅ Configure Firebase project
3. ✅ Deploy to Firebase Hosting
4. ✅ Set up automatic deployments (optional)

---

## Part 1: GitHub Setup

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click **"+"** → **"New repository"**
3. Name it: `galactic-strategist` (or any name you like)
4. Set to **Private** (since it's for trusted friends)
5. **Don't** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### Step 2: Initialize Git in Your Project

Open terminal in your project folder (`E:\Data\Game`) and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Galactic Strategist game"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/galactic-strategist.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** You may be prompted to enter your GitHub credentials. Use a Personal Access Token if needed.

### Step 3: Create .gitignore

Create a `.gitignore` file to exclude sensitive files:

```bash
# Create .gitignore
echo "firebase-debug.log" > .gitignore
echo "node_modules/" >> .gitignore
echo ".firebase/" >> .gitignore
```

**⚠️ IMPORTANT:** Do NOT commit `firebase-config.js` if it contains real credentials! (See security section below)

---

## Part 2: Firebase Configuration

### Step 1: Create/Use Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or use existing project (`test-c409c`)
3. Enter project name: `Galactic Strategist` (or your choice)
4. Continue through setup (disable Google Analytics if not needed)
5. Click **"Create project"**

### Step 2: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in left menu
2. Click **"Create database"**
3. Start in **"Production mode"** (or Test mode for quick start)
4. Choose location closest to your users
5. Click **"Enable"**

### Step 3: Configure Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{document=**} {
      // Allow anyone to read scores (for leaderboard)
      allow read: if true;
      // Allow writes for authenticated users
      // For simple setup, allow all writes (adjust for production)
      allow write: if true;
    }
  }
}
```

3. Click **"Publish"**

### Step 4: Firestore Index Setup

**Good News:** For a simple `orderBy('score')` query, you **don't need to create an index manually**! 

Firestore automatically creates single-field indexes. When you see the message:
> *"this index is not necessary, configure using single field index controls"*

This means Firestore will handle it automatically - **just skip creating the index**. ✅

**Only create an index if:**
- You see an error when loading the leaderboard
- The error message includes a link to create an index
- You're querying multiple fields together (composite query)

**If you do need to create one:**
1. Go to **Firestore Database** → **Indexes** tab
2. Click the **link in the error message** (Firebase will auto-create it for you)
3. Wait for it to build (usually takes 1-2 minutes)

**For now, skip this step and proceed!** The index will be created automatically when needed.

### Step 5: Get Firebase Web Config

1. In Firebase Console, click gear icon ⚙️ → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click **"</>"** (Web) icon
4. Register app: Name it `Galactic Strategist Web`
5. Copy the `firebaseConfig` object

### Step 6: Update firebase-config.js

Edit `firebase-config.js` and replace with your actual config:

```javascript
const firebaseConfig = {
    apiKey: "AIza...", // Your actual API key
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// ... rest of the file
```

### Step 7: Configure Email Whitelist

Edit `whitelist.js` and add your friends' emails:

```javascript
const AUTHORIZED_EMAILS = [
    'friend1@example.com',
    'friend2@example.com',
    // ... add up to 20 emails
];
```

---

## Part 3: Firebase Hosting Setup

### Step 1: Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window. Sign in with your Google account.

### Step 3: Initialize Firebase Hosting

```bash
# Make sure you're in your project directory
cd E:\Data\Game

# Initialize Firebase
firebase init hosting
```

**Answer the prompts:**
- ✅ Use an existing project → Select your Firebase project
- Public directory: **`.`** (current directory - dot)
- Configure as single-page app: **No**
- Set up automatic builds: **No**
- Overwrite index.html: **No** (we already have it)

This creates `firebase.json` and `.firebaserc` files.

### Step 4: Verify firebase.json

Your `firebase.json` should look like this:

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

**✅ Your current `firebase.json` is correct!**

**Why no rewrites?**
- This is a **multi-page app** with separate HTML files (`index.html`, `login.html`, `leaderboard.html`)
- Firebase will serve each HTML file directly when accessed
- No rewrites needed - everything works as-is!

**Optional:** If you want a custom 404 page, you can add a `404.html` file (you already have one), and Firebase will automatically use it for missing pages. No rewrites needed for that!

---

## Part 4: Deploy!

### Step 1: Test Locally (Optional)

```bash
firebase serve
```

Visit `http://localhost:5000` to test before deploying.

### Step 2: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

You'll see output like:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project/overview
Hosting URL: https://your-project.web.app
```

### Step 3: Share Your Game!

Your game is now live at:
- `https://your-project.web.app`
- `https://your-project.firebaseapp.com`

Share this URL with your trusted friends!

---

## Part 5: Security Best Practices

### ⚠️ Keep Credentials Safe

**Option 1: Environment Variables (Recommended)**

1. Create `firebase-config.template.js`:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    // ... other placeholders
};
```

2. Add to `.gitignore`:
```
firebase-config.js
```

3. Friends can copy template and fill in values (or you share via secure channel)

**Option 2: Firebase Hosting Environment Variables**

For production, consider using Firebase Hosting environment variables (advanced).

### ✅ Public Files Are Safe

- Firebase API keys in frontend code are **public by design**
- They're restricted by Firestore security rules
- Your security comes from:
  - Email whitelist (in `whitelist.js`)
  - Firestore security rules
  - Private GitHub repository

---

## Part 6: Automatic Deployments (Optional)

Set up GitHub Actions to auto-deploy on push:

### Step 1: Get Firebase Token

```bash
firebase login:ci
```

Copy the token (you'll need it in next step).

### Step 2: Add GitHub Secret

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `FIREBASE_TOKEN`
4. Value: Paste the token from Step 1
5. Click **"Add secret"**

### Step 3: Create GitHub Actions Workflow

The workflow file has been created at `.github/workflows/deploy.yml`.

**Update the project ID** in the file:
- Open `.github/workflows/deploy.yml`
- Replace `galaxy-e07b4` with your Firebase project ID if different

The workflow will automatically deploy when you push to the `main` branch.

### Step 4: Commit and Push

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment"
git push
```

Now every push to `main` will automatically deploy!

---

## Part 7: Updating Your Game

### Regular Updates

```bash
# Make changes to your files
# Test locally
firebase serve

# Commit changes
git add .
git commit -m "Description of changes"
git push

# Deploy to Firebase
firebase deploy --only hosting
```

### Adding New Features

1. Make changes locally
2. Test with `firebase serve`
3. Commit to GitHub
4. Deploy to Firebase

---

## Quick Reference

### Common Commands

```bash
# Test locally
firebase serve

# Deploy to Firebase
firebase deploy --only hosting

# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

### Firebase Console URLs

- **Project Overview:** https://console.firebase.google.com/project/YOUR_PROJECT/overview
- **Firestore Database:** https://console.firebase.google.com/project/YOUR_PROJECT/firestore
- **Hosting:** https://console.firebase.google.com/project/YOUR_PROJECT/hosting
- **Project Settings:** https://console.firebase.google.com/project/YOUR_PROJECT/settings

---

## Troubleshooting

### Deployment Fails

1. **Check Firebase login:**
   ```bash
   firebase login --reauth
   ```

2. **Check project:**
   ```bash
   firebase use
   ```

3. **View logs:**
   ```bash
   firebase deploy --only hosting --debug
   ```

### Scores Not Saving

See `TROUBLESHOOTING.md` for detailed debugging.

### Custom Domain (Optional)

1. Firebase Console → Hosting → Add custom domain
2. Follow DNS setup instructions
3. Your game will be available at your custom domain!

---

## Summary Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Security rules configured
- [ ] Firestore index created
- [ ] Firebase config added to `firebase-config.js`
- [ ] Email whitelist configured in `whitelist.js`
- [ ] Firebase CLI installed
- [ ] Firebase hosting initialized
- [ ] Deployed to Firebase Hosting
- [ ] Game URL shared with friends
- [ ] (Optional) GitHub Actions set up

---

**🎉 Congratulations! Your game is now live on the web!**

Need help? Check `TROUBLESHOOTING.md` or Firebase documentation.

