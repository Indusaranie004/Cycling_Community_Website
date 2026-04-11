import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD9Yk24fdPcZrELZriLolon-MkEM5KrAbY",
  authDomain: "cycling-route-1382c.firebaseapp.com",
  projectId: "cycling-route-1382c",
  storageBucket: "cycling-route-1382c.firebasestorage.app",
  messagingSenderId: "921165492719",
  appId: "1:921165492719:web:6bdffdd0c40d6f41e2c61a"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// PASTE YOUR REAL VAPID KEY HERE
const VAPID_KEY = "BPn8guHL-Hkm2PbkiQczKo6RciTy7r97jg6Oygd62x_coOjgL9q-09dYJvtdO9XHiHSegZrIq7W_xtNZKkEbNRY"; 

export const requestForToken = async (updateFcmRoute) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Pass the VAPID key correctly
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (currentToken) {
        console.log("Token generated:", currentToken);
        // Save to local storage so other components can use it
        localStorage.setItem('fcmToken', currentToken);
        await updateFcmRoute(currentToken);
        return currentToken;
      }
    }
  } catch (err) {
    console.error("An error occurred while retrieving token: ", err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });