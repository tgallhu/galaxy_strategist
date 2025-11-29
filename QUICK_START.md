# ⚡ Quick Start - Deploy in 10 Minutes

Super fast deployment guide. For detailed steps, see `DEPLOYMENT.md`.

## Prerequisites

- GitHub account
- Firebase account (free tier works)
- Node.js installed (for Firebase CLI)

---

## 🚀 Fast Track (5 Steps)

### 1️⃣ Create GitHub Repo

```bash
cd E:\Data\Game
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/galactic-strategist.git
git push -u origin main
```

### 2️⃣ Setup Firebase

1. Go to https://console.firebase.google.com/
2. Create project → Enable Firestore → Copy config
3. Edit `firebase-config.js` → Paste your config

### 3️⃣ Configure Whitelist

Edit `whitelist.js` → Add friend emails

### 4️⃣ Deploy

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Answer prompts (use existing project, public dir = ".")
firebase deploy --only hosting
```

### 5️⃣ Share!

Your game is live at: `https://YOUR_PROJECT.web.app`

---

## ⚙️ Firestore Setup (2 minutes)

1. Firebase Console → Firestore Database → Create database
2. **Rules** tab → Paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. **Indexes** - Skip this! Firestore auto-creates single-field indexes.
   - If you see "index not necessary" message → That's correct, skip it!
   - Only create if you get an error with a link in it

---

## ✅ Done!

Your game is live! Check `DEPLOYMENT.md` for advanced setup.

