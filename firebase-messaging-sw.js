// Service Worker for Firebase Cloud Messaging
// This file must be in the root directory and named exactly "firebase-messaging-sw.js"

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
    apiKey: "AIzaSyBVBwuN6CiVJGCQvZE3rtCUoQwM7c75L48",
    authDomain: "galaxy-e07b4.firebaseapp.com",
    projectId: "galaxy-e07b4",
    storageBucket: "galaxy-e07b4.firebasestorage.app",
    messagingSenderId: "33252680716",
    appId: "1:33252680716:web:73cf58b5b5f4dd19597a29",
    measurementId: "G-TQ08ZYT2JX"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Galactic Strategist';
    const notificationOptions = {
        body: payload.notification?.body || 'New notification',
        icon: payload.notification?.icon || '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'galactic-strategist',
        vibrate: [200, 100, 200],
        data: payload.data
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);
    event.notification.close();

    // Open the app
    event.waitUntil(
        clients.openWindow('/')
    );
});
