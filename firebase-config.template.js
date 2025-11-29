// Firebase configuration TEMPLATE
// Copy this file to firebase-config.js and fill in your actual Firebase project details
// Get these from: Firebase Console > Project Settings > Your apps > Config

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if Firebase config is set up
function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "YOUR_API_KEY" && 
           firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

// Initialize Firebase (only if not already initialized)
if (typeof firebase !== 'undefined') {
    if (!isFirebaseConfigured()) {
        console.warn('⚠️ Firebase not configured! Please edit firebase-config.js with your Firebase project details.');
        console.warn('   Get your config from: Firebase Console > Project Settings > Your apps > Config');
    } else if (!firebase.apps.length) {
        try {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Firebase:', error);
        }
    }
} else {
    console.error('❌ Firebase SDK not loaded. Make sure Firebase scripts are included in your HTML.');
}

