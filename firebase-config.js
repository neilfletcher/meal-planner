// Firebase configuration for Plate & List.
//
// Paste in your own project's web config below (Firebase console > Project
// settings > General > Your apps > SDK setup and configuration). This object
// is not a secret: it is safe to commit and publish, including on a public
// GitHub Pages site. It just tells the Firebase SDK which project to talk
// to. Access to your data is controlled separately, by the Firestore
// security rules and by the list of authorised domains for sign-in (both
// covered in README.md).
//
// Until you fill this in with real values, the app runs happily on its own
// with everything saved to this browser only (no sign-in, no cross-device
// sync).

var firebaseConfig = {
  apiKey: "AIzaSyDiDsWT2ptdpDeqXbXUcSCwd3cUtUjQQnU",
  authDomain: "meal-planner-ef3d5.firebaseapp.com",
  projectId: "meal-planner-ef3d5",
  storageBucket: "meal-planner-ef3d5.firebasestorage.app",
  messagingSenderId: "757641932747",
  appId: "1:757641932747:web:225149d8ef70c8d46e904e"
};

(function () {
  "use strict";
  var isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey.indexOf("YOUR_") !== 0;
  if (!isConfigured || typeof firebase === "undefined") {
    if (!isConfigured) {
      console.info("Plate & List: firebase-config.js still has placeholder values, so sign-in and cross-device sync are off. See README.md to turn them on.");
    }
    return;
  }
  firebase.initializeApp(firebaseConfig);
  window.firebaseAuth = firebase.auth();
  window.firebaseDb = firebase.firestore();
})();
