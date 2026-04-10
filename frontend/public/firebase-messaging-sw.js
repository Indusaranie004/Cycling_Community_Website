// public/firebase-messaging-sw.js

// These scripts allow the service worker to use the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// USE THE EXACT SAME CONFIG AS YOUR firebase-config.js
firebase.initializeApp({
  apiKey: "AIzaSyD9Yk24fdPcZrELZriLolon-MkEM5KrAbY", 
  authDomain: "cycling-route-1382c.firebaseapp.com",
  projectId: "cycling-route-1382c",
  storageBucket: "cycling-route-1382c.firebasestorage.app",
  messagingSenderId: "921165492719",
  appId: "1:921165492719:web:6bdffdd0c40d6f41e2c61a"
});

const messaging = firebase.messaging();

// This function triggers when a push notification is received while the 
// app is in the background (tab closed or minimized).
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title || "Hazard Alert";
  const notificationOptions = {
    body: payload.notification.body || "A hazard has expired.",
    icon: '/logo192.png', // Ensure this file exists in your public folder
    badge: '/logo192.png', // Small icon for mobile status bars
    data: payload.data     // Carries extra info (like interactionId)
  };

  // This line physically shows the notification on the user's screen
  self.registration.showNotification(notificationTitle, notificationOptions);
});