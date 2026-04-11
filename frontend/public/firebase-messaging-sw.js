// public/firebase-messaging-sw.js

// These scripts allow the service worker to use the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const urlParams = new URLSearchParams(location.search);

const firebaseConfig = {
  apiKey: urlParams.get('apiKey'),
  authDomain: urlParams.get('authDomain'),
  projectId: urlParams.get('projectId'),
  storageBucket: urlParams.get('storageBucket'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId')
};

firebase.initializeApp(firebaseConfig);

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