// public/firebase-messaging-sw.js

// These scripts allow the service worker to use the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// USE THE EXACT SAME CONFIG AS YOUR firebase-config.js
firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
});

const messaging = firebase.messaging();

// This function triggers when a push notification is received while the 
// app is in the background (tab closed or minimized).
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title || "Hazard Alert";
  const notificationOptions = {
    body: payload.notification.body || "A hazard has expired.",
    icon: '/logo192.png', 
    badge: '/logo192.png', 
    data: payload.data     
  };

  // This line physically shows the notification on the user's screen
  self.registration.showNotification(notificationTitle, notificationOptions);
});