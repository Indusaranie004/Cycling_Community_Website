import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'mapbox-gl/dist/mapbox-gl.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if ('serviceWorker' in navigator) {
  const swUrl = `${process.env.PUBLIC_URL}/firebase-messaging-sw.js?` +
    `apiKey=${process.env.REACT_APP_FIREBASE_API_KEY}` +
    `&authDomain=${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN}` +
    `&projectId=${process.env.REACT_APP_FIREBASE_PROJECT_ID}` +
    `&storageBucket=${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET}` +
    `&messagingSenderId=${process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID}` +
    `&appId=${process.env.REACT_APP_FIREBASE_APP_ID}`;

  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Firebase Service Worker registered successfully');
    })
    .catch((err) => {
      console.error('Firebase Service Worker registration failed:', err);
    });
}
