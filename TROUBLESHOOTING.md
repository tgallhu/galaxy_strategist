# Troubleshooting: Empty Leaderboard

If you see "Score saved!" but the leaderboard is empty, here's how to debug:

## Step 1: Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab. Look for:

- ✅ **Green checkmarks** = Success messages
- ❌ **Red X marks** = Error messages
- 🔍 **Search icons** = Debugging info

## Step 2: Common Issues & Fixes

### Issue 1: Firebase Not Configured

**Symptoms:**
- Console shows: "Firebase SDK not loaded" or "Firebase not initialized"
- Error: "Cannot save score: Firestore not initialized"

**Fix:**
1. Open `firebase-config.js`
2. Make sure you've replaced ALL placeholder values with your actual Firebase config
3. Check that Firebase SDK scripts are loaded in `index.html`

### Issue 2: Firestore Security Rules Blocking

**Symptoms:**
- Console shows: "Permission denied" errors
- Scores appear to save but don't show up

**Fix:**
1. Go to Firebase Console → Firestore Database → Rules
2. Update rules to allow reads:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{document=**} {
      // Allow anyone to read scores (for leaderboard)
      allow read: if true;
      // Allow writes (for saving scores)
      allow write: if true;
    }
  }
}
```

3. Click **Publish**

**Note:** For production, use more restrictive rules, but for testing with trusted friends, this is fine.

### Issue 3: Firestore Index Missing

**Symptoms:**
- Console shows: "failed-precondition" error
- Error message mentions "index" or "composite index"

**Important:** For simple single-field queries like `orderBy('score')`, Firestore auto-creates indexes. You usually don't need to create one!

**If you see:**
- "this index is not necessary" → ✅ **That's correct! Skip it.**
- "failed-precondition" with a link → Click the link to auto-create

**Fix:**
1. **First, try the leaderboard** - it might work without creating anything!
2. If you get an error with a **link in the error message**, click it
3. Firebase will auto-create the index (wait 1-2 minutes for it to build)
4. Refresh the leaderboard page

**Note:** Composite indexes are only needed when querying multiple fields together. Our simple query doesn't need one.

### Issue 4: Scores Not Actually Saving

**Symptoms:**
- "Score saved!" shows but console shows errors

**Check:**
1. Open browser Console (F12)
2. Look for "❌ Error saving score" messages
3. Check the error details

**Fix:**
- Follow the error message suggestions
- Check Firebase Console → Firestore Database → Data
- See if the `scores` collection exists and has documents

### Issue 5: Query Returns Empty

**Symptoms:**
- No errors in console
- But leaderboard shows "No scores yet"

**Check:**
1. Go to Firebase Console → Firestore Database
2. Click on the `scores` collection
3. Do you see any documents?

**If NO documents:**
- Scores aren't saving (check Issue 4)

**If documents exist:**
- Check if they have a `score` field
- Check if the `score` field is a number (not string)
- Try refreshing the leaderboard page

## Step 3: Verify Data in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Check if `scores` collection exists
5. Check if there are any documents

**What a score document should look like:**
```
- name: "John Doe"
- email: "john@example.com"
- score: 5000 (NUMBER, not string!)
- level: 2
- timeSeconds: 120.5
- ammoUsed: 45
- timestamp: (Firestore timestamp)
- date: "2025-11-30T12:00:00.000Z"
```

## Step 4: Test Score Saving

1. Play the game
2. End the game (victory or game over)
3. Open Console (F12)
4. Look for these messages:
   - "Attempting to save score:" - Shows the data being saved
   - "✅ Score saved successfully to Firebase" - Success!
   - "❌ Error saving score:" - Something went wrong

## Step 5: Test Leaderboard Loading

1. Open `leaderboard.html`
2. Open Console (F12)
3. Look for:
   - "🔍 Initializing Firestore..." 
   - "✅ Firestore initialized"
   - "📊 Fetching leaderboard..."
   - "📄 Query returned X documents"
   - "✅ Parsed X scores"

## Quick Debug Checklist

- [ ] Firebase config file has real values (not placeholders)
- [ ] Firebase SDK scripts are loaded in HTML
- [ ] Firestore security rules allow read/write
- [ ] Firestore database is created
- [ ] Scores collection exists in Firestore
- [ ] Score documents have a `score` field (as number)
- [ ] Browser console shows no errors
- [ ] Check Network tab for failed Firebase requests

## Still Not Working?

1. **Copy all console errors** and check what they say
2. **Check Firebase Console** → Firestore → Data tab
3. **Verify Firebase config** is correct
4. **Try saving a test score manually** in Firebase Console to verify leaderboard can read it

If scores are saving but not showing:
- Make sure the `score` field is a **number** (not string "5000" but number 5000)
- Make sure Firestore index is created for `score` field descending
- Check security rules allow reading

