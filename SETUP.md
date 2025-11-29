# Quick Setup Guide

## 🚀 Very Simple Authorization System

I've created a **super simple** authorization system for your 20 trusted friends:

### What You Need to Do:

#### 1. Add Friend Emails (2 minutes)

Edit `whitelist.js` and add your friends' emails:

```javascript
const AUTHORIZED_EMAILS = [
    'alice@example.com',
    'bob@example.com',
    'charlie@example.com',
    // ... add up to 20 emails
];
```

#### 2. Setup Firebase (5 minutes)

1. Go to https://console.firebase.google.com/
2. Use your existing project: `test-c409c`
3. Go to **Firestore Database** → Create database → Start in test mode
4. Go to **Project Settings** → Your apps → Copy config
5. Edit `firebase-config.js` and paste your config

#### 3. Deploy (2 minutes)

```bash
firebase deploy --only hosting
```

**That's it!** 🎉

### How It Works:

- **Login**: Friends enter name + email → System checks whitelist → Access granted
- **Storage**: All scores automatically saved to Firebase (name, email, score, time, ammo)
- **Simple**: No passwords, no complex auth, just trusted emails

### Files Created:

- ✅ `whitelist.js` - Add friend emails here
- ✅ `login.html` - Beautiful login page
- ✅ `auth.js` - Simple auth logic
- ✅ `firebase-config.js` - Your Firebase config
- ✅ `scores.js` - Score saving to Firebase
- ✅ Updated `index.html` - Checks auth before game
- ✅ Updated `game.js` - Saves scores when game ends

### Viewing Scores:

Go to Firebase Console → Firestore → `scores` collection to see all player scores!

### Adding More Friends:

Just edit `whitelist.js` and add more emails. No deployment needed for new users (they can login immediately).

