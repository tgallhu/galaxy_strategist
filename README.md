# 🚀 Galactic Strategist

A retro space shooter game with leaderboards and multiplayer scoring for trusted friends.

![Game Preview](https://via.placeholder.com/800x400/000015/00FFFF?text=Galactic+Strategist)

## 🎮 Features

- **3 Challenging Levels** - Progressive difficulty with unique formations
- **Retro Graphics** - Pixel-art style with modern gameplay
- **Score System** - Compete for high scores based on speed and accuracy
- **Leaderboard** - See top players with retro avatars
- **Simple Auth** - Email whitelist for trusted friends
- **Firebase Integration** - Cloud-based score storage

## 📋 Quick Links

- **[QUICK_START.md](QUICK_START.md)** - Deploy in 10 minutes ⚡
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide 🚀
- **[SETUP.md](SETUP.md)** - Initial setup instructions ⚙️
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues & fixes 🔧

## 🎯 Getting Started

### For Players

1. Visit the game URL (shared by admin)
2. Enter your name and email
3. Play and compete for high scores!

### For Developers/Admins

1. **Setup** - Follow [SETUP.md](SETUP.md)
2. **Deploy** - Use [QUICK_START.md](QUICK_START.md) for fast deployment
3. **Configure** - Add friend emails to `whitelist.js`

## 📁 Project Structure

```
├── index.html              # Main game page
├── login.html              # Login page
├── leaderboard.html        # Score leaderboard
├── game.js                 # Game logic
├── auth.js                 # Authentication
├── scores.js               # Score management
├── avatars.js              # Retro avatar generator
├── whitelist.js            # Authorized emails (EDIT THIS)
├── firebase-config.js      # Firebase configuration (EDIT THIS)
└── style.css               # Styling
```

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5 Canvas
- **Backend:** Firebase Firestore
- **Hosting:** Firebase Hosting
- **Auth:** Simple email whitelist
- **Storage:** Firebase Firestore

## 🔐 Security

- Email whitelist authentication
- Firestore security rules
- Private GitHub repository (optional)

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide with GitHub integration
- **[QUICK_START.md](QUICK_START.md)** - Fast-track deployment (10 minutes)
- **[SETUP.md](SETUP.md)** - Initial configuration
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Debugging guide

## 🎮 How to Play

- **Arrow Keys** - Move left/right
- **Space** - Shoot
- **G** - Launch grenade
- **M** - Toggle audio

## 📊 Scoring

Scores are calculated based on:
- **Time** - Faster completion = higher score
- **Ammo Efficiency** - Less ammo used = higher score

Perfect run formula: `(10000 - time*100) + (1000 - ammo*50)`

## 🚀 Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete instructions.

**Quick deploy:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy --only hosting
```

## 👥 Adding Players

Edit `whitelist.js`:
```javascript
const AUTHORIZED_EMAILS = [
    'friend1@example.com',
    'friend2@example.com',
    // ... add emails
];
```

## 🐛 Troubleshooting

Having issues? Check **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

Common issues:
- Leaderboard empty → Check Firestore rules and indexes
- Scores not saving → Check Firebase configuration
- Login fails → Verify email is in whitelist

## 📝 License

Private project for trusted friends.

## 🤝 Contributing

This is a private project. Contact the admin to join the whitelist.

---

**Made with ❤️ for space gaming enthusiasts**
