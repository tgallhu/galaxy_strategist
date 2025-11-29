// Firebase configuration
// Replace these with your actual Firebase project config
// Get this from: Firebase Console > Project Settings > Your apps > Config

const firebaseConfig = {
    apiKey: "AIzaSyBVBwuN6CiVJGCQvZE3rtCUoQwM7c75L48",
    authDomain: "galaxy-e07b4.firebaseapp.com",
    projectId: "galaxy-e07b4",
    storageBucket: "galaxy-e07b4.firebasestorage.app",
    messagingSenderId: "33252680716",
    appId: "1:33252680716:web:73cf58b5b5f4dd19597a29",
    measurementId: "G-TQ08ZYT2JX"
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

