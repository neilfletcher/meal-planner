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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
