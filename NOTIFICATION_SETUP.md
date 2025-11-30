# Push Notification Setup Guide

This guide will help you configure push notifications for Galactic Strategist.

## Features Implemented

1. **Welcome Notification**: First-time users receive a welcome notification with "Üdvözöllek a Galaxisban!" message and a retro avatar
2. **Score Notifications**: All users receive notifications when any player scores points

## Setup Steps

### 1. Deploy Firestore Rules

The Firestore security rules have been updated to allow notifications. Deploy them:

```bash
firebase deploy --only firestore:rules
```

### 2. Enable Firebase Cloud Messaging (FCM)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `galaxy-e07b4`
3. Navigate to **Build** → **Cloud Messaging**
4. If not already enabled, click **Enable** for Cloud Messaging

### 3. Generate VAPID Key

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click on the **Cloud Messaging** tab
3. Scroll down to **Web configuration**
4. Under **Web Push certificates**, click **Generate key pair**
5. Copy the generated VAPID key

### 4. Update notifications.js with VAPID Key

Open `notifications.js` and replace `YOUR_VAPID_KEY` with your actual VAPID key:

```javascript
const token = await messaging.getToken({
    vapidKey: 'YOUR_VAPID_KEY_HERE' // Replace this
});
```

### 5. Test the Notifications

#### Test Welcome Notification:
1. Clear your browser's localStorage (to simulate first-time login)
2. Log in to the game
3. You should see a notification: "Üdvözöllek a Galaxisban, [Your Name]!"

#### Test Score Notification:
1. Have multiple browser tabs/windows open with different users
2. Score points in one tab
3. All other tabs should receive a notification about the score

## How It Works

### Welcome Notifications
- `auth.js` tracks first-time logins in localStorage
- When a user logs in for the first time, `needsWelcomeNotification` flag is set
- `index.html` checks this flag and calls `sendWelcomeNotification()`
- The notification shows a retro avatar and the Hungarian welcome message

### Score Notifications
- When `saveScore()` is called in `scores.js`, it triggers `broadcastScoreNotification()`
- The notification is saved to Firestore `notifications` collection
- All connected clients listen to this collection via Firestore real-time listeners
- Each client shows a local notification when a new score is detected

## Browser Permissions

Users will be prompted to allow notifications when they first visit the site. They must click **Allow** for notifications to work.

## Fallback Behavior

If FCM is not fully configured:
- The system will fall back to local browser notifications
- Notifications will still work within the same browser session
- Firestore listeners will sync notifications across all connected clients
- Users will see console warnings about missing VAPID key

## Testing Without FCM Setup

Even without completing the VAPID key setup, you can test basic functionality:
1. Notifications will work as local browser notifications
2. Multiple tabs will receive score updates via Firestore listeners
3. Welcome notifications will display for first-time users

## Production Considerations

### Security
⚠️ **Important**: The current Firestore rules allow open read/write to notifications and FCM tokens. For production:

1. Implement Firebase Authentication (not just localStorage)
2. Update Firestore rules to restrict based on authenticated users
3. Consider rate limiting for notification broadcasts

### Optional: Cloud Functions

For more robust notifications, consider implementing Firebase Cloud Functions:

```javascript
// functions/index.js
exports.broadcastScoreNotification = functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();

        if (data.broadcast && data.type === 'score') {
            // Get all FCM tokens
            const tokensSnapshot = await admin.firestore()
                .collection('fcm_tokens').get();

            const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

            // Send to all devices
            await admin.messaging().sendToDevice(tokens, {
                notification: {
                    title: data.title,
                    body: data.body,
                    icon: '/icon-192.png'
                }
            });
        }
    });
```

## Troubleshooting

### Notifications not showing
1. Check browser console for errors
2. Verify notification permission is granted
3. Check that Firebase Messaging SDK loaded correctly
4. Ensure Firestore rules are deployed

### FCM Token errors
- This is expected until you add the VAPID key
- Notifications will still work via Firestore listeners

### Service Worker not loading
- Ensure `firebase-messaging-sw.js` is in the root directory
- Check browser DevTools → Application → Service Workers
- Try unregistering and re-registering the service worker

## Files Modified

- ✅ `notifications.js` - Main notification system
- ✅ `firebase-messaging-sw.js` - Service worker for background notifications
- ✅ `auth.js` - First-time login tracking
- ✅ `scores.js` - Score notification broadcasting
- ✅ `index.html` - Added notification script and Firebase Messaging SDK
- ✅ `firestore.rules` - Security rules for notifications

## Next Steps

1. Deploy the updated code to Firebase Hosting
2. Deploy the Firestore rules
3. Generate and add VAPID key
4. Test with multiple users
5. (Optional) Implement Cloud Functions for server-side notifications
6. (Optional) Implement Firebase Authentication for better security
