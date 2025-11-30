// Push Notification System for Galactic Strategist
// Handles welcome notifications and score update broadcasts

// Initialize Firebase Cloud Messaging
let messaging = null;
let notificationPermission = false;

// Retro avatar for notifications (data URL)
const RETRO_AVATAR = 'data:image/svg+xml;base64,' + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#1a1a2e"/>
  <rect x="16" y="16" width="8" height="8" fill="#00FFFF"/>
  <rect x="40" y="16" width="8" height="8" fill="#00FFFF"/>
  <rect x="24" y="32" width="16" height="8" fill="#00FFFF"/>
  <rect x="20" y="40" width="24" height="4" fill="#00FFFF"/>
</svg>
`);

// Initialize FCM
async function initNotifications() {
    console.log('🔔 Initializing notifications...');

    if (typeof firebase === 'undefined' || !firebase.messaging) {
        console.warn('⚠️ Firebase Messaging not loaded');
        return false;
    }

    try {
        // Register service worker first
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('✅ Service Worker registered:', registration);

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('✅ Service Worker ready');
        }

        messaging = firebase.messaging();
        console.log('✅ Firebase Messaging initialized');

        // Don't auto-request permission - wait for user gesture
        // Permission will be requested on first user interaction
        console.log('💡 Notification permission will be requested on user interaction');

        return true;
    } catch (error) {
        console.error('❌ Error initializing notifications:', error);
        return false;
    }
}

// Request notification permission from user
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('⚠️ This browser does not support notifications');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        notificationPermission = permission === 'granted';

        if (notificationPermission) {
            console.log('✅ Notification permission granted');

            // Get FCM token if messaging is available
            if (messaging) {
                try {
                    // Check if service worker is ready
                    const swRegistration = await navigator.serviceWorker.ready;

                    const token = await messaging.getToken({
                        vapidKey: 'BC7dzTYq836fXSeZ5e2clD6CMdilMRSomN8Xt5aLNxffX_Kjjn2Fd59YqyCSivgxQDSQUzY-PoJD-vbMrZZdlug', // You'll need to add your VAPID key from Firebase Console
                        serviceWorkerRegistration: swRegistration
                    });
                    console.log('🔑 FCM Token:', token);

                    // Save token to Firestore for the current user
                    await saveFCMToken(token);
                } catch (tokenError) {
                    console.warn('⚠️ Could not get FCM token:', tokenError.message);
                    console.warn('   This is normal if VAPID key is not configured yet.');
                    console.warn('   Notifications will still work using local browser notifications + Firestore sync.');
                    // Continue without FCM - we'll use local notifications
                }
            }
        } else {
            console.log('❌ Notification permission denied');
        }

        return notificationPermission;
    } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
        return false;
    }
}

// Save FCM token to Firestore for push notifications
async function saveFCMToken(token) {
    if (!window.db || !window.currentUser) {
        return;
    }

    try {
        await window.db.collection('fcm_tokens').doc(window.currentUser.email).set({
            token: token,
            email: window.currentUser.email,
            name: window.currentUser.name,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log('✅ FCM token saved to Firestore');
    } catch (error) {
        console.error('❌ Error saving FCM token:', error);
    }
}

// Show local notification (fallback when FCM is not available)
function showLocalNotification(title, body, icon = RETRO_AVATAR) {
    console.log('🔔 showLocalNotification called:', { title, body, notificationPermission });

    if (!notificationPermission) {
        console.log('📢 Notification (no permission):', title, '-', body);
        return;
    }

    // Check actual Notification permission
    if (Notification.permission !== 'granted') {
        console.warn('⚠️ Notification.permission is not granted:', Notification.permission);
        return;
    }

    try {
        console.log('📬 Creating new Notification...');
        const notification = new Notification(title, {
            body: body,
            icon: icon,
            badge: RETRO_AVATAR,
            tag: 'galactic-strategist',
            vibrate: [200, 100, 200],
            requireInteraction: false
        });
        console.log('✅ Notification created:', notification);
    } catch (error) {
        console.error('❌ Error showing notification:', error);
    }
}

// Send welcome notification for first-time users
async function sendWelcomeNotification(userName) {
    console.log('👋 Sending welcome notification to:', userName);

    const title = 'Galactic Strategist';
    const body = `Üdvözöllek a Galaxisban, ${userName}!`;

    // Show local notification
    showLocalNotification(title, body);

    // Also save to Firestore to trigger cloud function (if configured)
    try {
        if (window.db && window.currentUser) {
            await window.db.collection('notifications').add({
                type: 'welcome',
                userId: window.currentUser.email,
                userName: userName,
                title: title,
                body: body,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                sent: true
            });
        }
    } catch (error) {
        console.error('❌ Error saving welcome notification:', error);
    }
}

// Broadcast score notification to all users
async function broadcastScoreNotification(playerName, score, level) {
    console.log('📢 Broadcasting score notification:', playerName, score);

    const title = '🎮 Új Pont!';
    const body = `${playerName} elért ${score} pontot (Szint ${level})!`;

    // Show local notification to current user
    showLocalNotification(title, body);

    // Save to Firestore to trigger cloud function for all users
    try {
        if (window.db) {
            await window.db.collection('notifications').add({
                type: 'score',
                playerName: playerName,
                score: score,
                level: level,
                title: title,
                body: body,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                broadcast: true // Flag to send to all users
            });

            console.log('✅ Score notification saved to Firestore');
        }
    } catch (error) {
        console.error('❌ Error broadcasting score notification:', error);
    }
}

// Listen for incoming messages (when FCM is configured)
function listenForNotifications() {
    if (!messaging) {
        console.log('⚠️ Messaging not initialized, using Firestore listener instead');
        listenForFirestoreNotifications();
        return;
    }

    // Handle foreground messages
    messaging.onMessage((payload) => {
        console.log('📬 Message received:', payload);

        const { title, body } = payload.notification || {};
        if (title && body) {
            showLocalNotification(title, body);
        }
    });
}

// Listen for notifications via Firestore (when FCM is not configured)
function listenForFirestoreNotifications() {
    if (!window.db) {
        return;
    }

    // Listen for new score notifications
    window.db.collection('notifications')
        .where('type', '==', 'score')
        .where('broadcast', '==', true)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    // Only show if it's recent (within last 10 seconds) and not from current user
                    const now = Date.now();
                    const notifTime = data.timestamp?.toMillis() || 0;

                    if (now - notifTime < 10000 && window.currentUser?.name !== data.playerName) {
                        showLocalNotification(data.title, data.body);
                    }
                }
            });
        }, (error) => {
            console.error('❌ Error listening for notifications:', error);
        });
}

// Request permission on user interaction
async function requestPermissionOnUserGesture() {
    if (notificationPermission) {
        return true; // Already granted
    }

    console.log('🖱️ User gesture detected, requesting notification permission...');
    return await requestNotificationPermission();
}

// Initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Wait a bit for Firebase to initialize
        setTimeout(async () => {
            await initNotifications();
            listenForNotifications();

            // Request permission on any click
            document.addEventListener('click', requestPermissionOnUserGesture, { once: true });

            // Also try on any key press
            document.addEventListener('keydown', requestPermissionOnUserGesture, { once: true });
        }, 1000);
    });
}
