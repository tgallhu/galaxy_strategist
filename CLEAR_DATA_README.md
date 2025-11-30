# Firebase Data Cleanup Tools

Two tools are provided for clearing test data from Firebase Firestore:

## 🌐 Web-Based Tool (Recommended)

**Location:** `admin/clear-data.html`

**Access:** http://localhost:5000/admin/clear-data.html

**Features:**
- ✅ No dependencies required
- ✅ Admin authentication required
- ✅ Visual interface with data counts
- ✅ Multiple deletion options:
  - Delete by collection (telemetry, scores, notifications, FCM tokens)
  - Delete by user email
  - Delete by date range
  - Delete all data
- ✅ Confirmation prompts for safety
- ✅ Real-time logging

**Usage:**
1. Make sure you're logged in as an admin
2. Navigate to `http://localhost:5000/admin/clear-data.html`
3. Click "Refresh Counts" to see current data
4. Choose deletion method
5. Confirm with "DELETE" when prompted

---

## 💻 Command-Line Tool

**Location:** `clear-firebase-data.js`

**Requirements:**
- Node.js installed
- `firebase-admin` package: `npm install firebase-admin`
- Service account key (`serviceAccountKey.json`)

**Get Service Account Key:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project Settings → Service Accounts
3. Click "Generate new private key"
4. Save as `serviceAccountKey.json` in project root

**Usage:**

```bash
# Delete entire collection
node clear-firebase-data.js --collection telemetry
node clear-firebase-data.js --collection scores

# Delete user's data
node clear-firebase-data.js --email test@example.com

# Delete ALL data (DANGER!)
node clear-firebase-data.js --all

# Show help
node clear-firebase-data.js --help
```

**Examples:**

```bash
# Clear all test telemetry
node clear-firebase-data.js -c telemetry

# Remove specific test user
node clear-firebase-data.js -e testuser@example.com

# Nuclear option - clear everything
node clear-firebase-data.js --all
```

---

## ⚠️ Safety Features

Both tools include safety measures:

1. **Admin-only access** (web tool)
2. **Confirmation prompts** - requires typing "DELETE"
3. **Double confirmation** for delete-all operations
4. **Logging** - shows what's being deleted
5. **Batch processing** - handles large datasets efficiently

---

## 📊 Available Collections

- `telemetry` - Gameplay analytics (sessions, kills, deaths)
- `scores` - Player scores and leaderboard
- `notifications` - Notification history
- `fcm_tokens` - Push notification device tokens

---

## 🔒 Security Notes

- **Web tool:** Requires admin email in whitelist
- **CLI tool:** Requires service account key (keep secure!)
- **Production:** Do NOT use without backup
- **Testing:** Safe to use for clearing test data

---

## 🆘 Troubleshooting

### Web tool shows "Access Denied"
- Make sure you're logged in
- Verify your email is in `admin-whitelist.js`

### CLI tool shows "firebase-admin not installed"
```bash
npm install firebase-admin
```

### CLI tool shows "serviceAccountKey.json not found"
- Download from Firebase Console
- Place in project root
- **Do NOT commit to git** (already in .gitignore)

### No data showing up
- Run `firebase serve` to start local server
- Navigate to `http://localhost:5000/admin/clear-data.html`
- Click "Refresh Counts"

---

## 💡 Best Practices

1. **Test with small datasets first**
2. **Use email filter** when possible (safer than deleting everything)
3. **Export data** before major deletions (Firebase Console → Firestore → Import/Export)
4. **Prefer web tool** for safety and ease of use
5. **Use CLI tool** for automation or large batch operations

---

## 🚀 Quick Start

**To clear all test data:**

1. Open http://localhost:5000/admin/clear-data.html
2. Log in as admin
3. Click "Refresh Counts" to see what's there
4. Click "DELETE ALL DATA FROM ALL COLLECTIONS"
5. Type "DELETE ALL" when prompted
6. Done!

**Or via command line:**

```bash
node clear-firebase-data.js --all
```

---

## 📝 Notes

- Deletions are **permanent** - no undo!
- Large collections may take time to delete
- Firestore billing based on operations (deletions count)
- Consider setting up **backups** for production data
