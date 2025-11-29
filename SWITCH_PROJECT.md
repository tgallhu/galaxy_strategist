# 🔄 Switch Firebase Project from "test" to "galaxy"

Guide to move your game hosting from the `test` project to the `galaxy` project.

## Current Setup
- **Project:** `test` (test-c409c)
- **Hosting URL:** https://test-c409c.web.app
- **Target:** Switch to `galaxy` project

---

## Step 1: Switch Firebase Project Association

### Option A: Using Firebase CLI (Recommended)

1. **List available projects:**
   ```bash
   firebase projects:list
   ```
   You should see both `test` and `galaxy` projects.

2. **Switch to galaxy project:**
   ```bash
   firebase use galaxy
   ```

3. **Verify the switch:**
   ```bash
   firebase use
   ```
   Should show: `Active Project: galaxy`

### Option B: Update .firebaserc file

If you have a `.firebaserc` file, edit it:

```json
{
  "projects": {
    "default": "galaxy"
  }
}
```

Or if it has aliases:
```json
{
  "projects": {
    "default": "galaxy",
    "test": "test-c409c",
    "galaxy": "galaxy"
  }
}
```

---

## Step 2: Get Galaxy Project's Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Switch to `galaxy` project** (dropdown at top)
3. Click ⚙️ **Settings** → **Project settings**
4. Scroll down to **"Your apps"** section
5. If no web app exists:
   - Click **"</>"** (Web) icon
   - Register app: Name it "Galactic Strategist Web"
6. **Copy the `firebaseConfig`** object

---

## Step 3: Update firebase-config.js

Edit `firebase-config.js` and replace with `galaxy` project's config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_GALAXY_API_KEY",
    authDomain: "galaxy.firebaseapp.com",  // or your galaxy domain
    projectId: "galaxy",                    // or your galaxy project ID
    storageBucket: "galaxy.appspot.com",
    messagingSenderId: "YOUR_GALAXY_SENDER_ID",
    appId: "YOUR_GALAXY_APP_ID"
};
```

**Replace all values** with the actual `galaxy` project config!

---

## Step 4: Setup Firestore in Galaxy Project

Since you're switching projects, you need to set up Firestore in the `galaxy` project:

1. **Go to Firebase Console** → Select `galaxy` project
2. **Firestore Database** → **Create database**
   - Start in **Production mode** (or Test mode)
   - Choose location
   - Click **Enable**

3. **Set Security Rules:**
   - Go to **Firestore Database** → **Rules** tab
   - Paste this:
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
   - Click **Publish**

4. **Create Index (if needed):**
   - Usually not needed, but if you get an error when loading leaderboard, click the link in the error

---

## Step 5: Verify Project Association

Check that everything points to `galaxy`:

```bash
# Check active project
firebase use

# Should show: Active Project: galaxy

# Check hosting config
firebase hosting:sites:list

# Should show galaxy project's hosting sites
```

---

## Step 6: Deploy to Galaxy Project

```bash
# Deploy to galaxy project
firebase deploy --only hosting
```

You should see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/galaxy/overview
Hosting URL: https://galaxy.web.app
```

**Your new URL will be:**
- `https://galaxy.web.app`
- `https://galaxy.firebaseapp.com`

---

## Step 7: Test Everything

1. **Visit your new URL:**
   - `https://galaxy.web.app`

2. **Test login:**
   - Make sure email whitelist is configured

3. **Test game:**
   - Play a game and save a score

4. **Test leaderboard:**
   - Check that scores appear (might be empty at first)

---

## Optional: Keep Both Projects Active

If you want to keep both projects available:

1. **Add project aliases:**
   ```bash
   firebase use --add
   ```
   - Alias: `test`
   - Project: `test-c409c`

   ```bash
   firebase use --add
   ```
   - Alias: `galaxy`
   - Project: `galaxy`

2. **Switch between them:**
   ```bash
   firebase use test      # Switch to test project
   firebase use galaxy    # Switch to galaxy project
   ```

3. **Deploy to specific project:**
   ```bash
   firebase use galaxy
   firebase deploy --only hosting
   ```

---

## Troubleshooting

### Issue: "Project not found"

**Fix:**
- Make sure you have access to the `galaxy` project
- Check project ID is correct: `firebase use galaxy`
- List projects: `firebase projects:list`

### Issue: Firestore not set up

**Fix:**
- Go to Firebase Console → `galaxy` project
- Enable Firestore Database
- Set up security rules (see Step 4)

### Issue: Scores not showing

**Fix:**
- Check that Firestore is enabled in `galaxy` project
- Verify security rules allow read/write
- Check that `firebase-config.js` has `galaxy` project config
- Scores from `test` project won't automatically transfer - they're separate databases

### Issue: Can't access galaxy project

**Fix:**
- Make sure you're the owner/admin of `galaxy` project
- Or have Editor permissions
- Check Firebase Console → Project Settings → Members

---

## Quick Reference Commands

```bash
# List all Firebase projects
firebase projects:list

# Switch to galaxy project
firebase use galaxy

# Check current project
firebase use

# Deploy to current project
firebase deploy --only hosting

# Switch to test project (if needed)
firebase use test
```

---

## Summary Checklist

- [ ] Switched to `galaxy` project: `firebase use galaxy`
- [ ] Updated `firebase-config.js` with galaxy project config
- [ ] Enabled Firestore in `galaxy` project
- [ ] Set Firestore security rules in `galaxy` project
- [ ] Deployed to `galaxy`: `firebase deploy --only hosting`
- [ ] Tested new URL: `https://galaxy.web.app`
- [ ] Tested login and game
- [ ] Tested leaderboard

---

**✅ After switching, your game will be at:**
- `https://galaxy.web.app`
- `https://galaxy.firebaseapp.com`

The old `test` project site will remain at:
- `https://test-c409c.web.app` (until you delete it)

