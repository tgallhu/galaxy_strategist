# 🔄 Switch Hosting to Galaxy Project

Quick guide to switch your Firebase hosting from `test` to `galaxy` project.

## Current Status
- ✅ **firebase-config.js** already has `galaxy-e07b4` config
- ⚠️ **Hosting** is still on `test` project (test-c409c)

## Quick Steps (2 minutes)

### Step 1: Switch Firebase Project

Run this command in your project directory:

```bash
firebase use galaxy-e07b4
```

Or if you set up an alias:

```bash
firebase use galaxy
```

### Step 2: Verify Switch

Check that you're now using the galaxy project:

```bash
firebase use
```

Should show:
```
Active Project: galaxy-e07b4 (galaxy)
```

### Step 3: Deploy to Galaxy

```bash
firebase deploy --only hosting
```

Your game will now be at:
- ✅ `https://galaxy-e07b4.web.app`
- ✅ `https://galaxy-e07b4.firebaseapp.com`

---

## Setup Firestore in Galaxy Project (If Not Done)

Since you're switching projects, make sure Firestore is set up in `galaxy`:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Switch to `galaxy` project** (top dropdown)
3. **Firestore Database** → **Create database** (if not exists)
4. **Rules** tab → Set rules:
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
5. Click **Publish**

---

## Check .firebaserc File

If the above doesn't work, check your `.firebaserc` file:

It should look like:
```json
{
  "projects": {
    "default": "galaxy-e07b4"
  }
}
```

Or with aliases:
```json
{
  "projects": {
    "default": "galaxy-e07b4",
    "test": "test-c409c",
    "galaxy": "galaxy-e07b4"
  }
}
```

If it shows `test-c409c` as default, either:
- Run `firebase use galaxy-e07b4` to switch, OR
- Edit `.firebaserc` to change `"default": "test-c409c"` to `"default": "galaxy-e07b4"`

---

## Verify Everything

1. **Check active project:**
   ```bash
   firebase use
   ```

2. **Check firebase-config.js:**
   - Should have `projectId: "galaxy-e07b4"` ✅ (already done!)

3. **Deploy:**
   ```bash
   firebase deploy --only hosting
   ```

4. **Visit new URL:**
   - `https://galaxy-e07b4.web.app`

---

## That's It!

Your game is now hosted on the `galaxy` project! 🚀

**Old site:** `https://test-c409c.web.app` (still exists, but not updated)
**New site:** `https://galaxy-e07b4.web.app` (active)

