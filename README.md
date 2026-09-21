# Plate & List

A week of ten-minute-prep dinners for one, with recipes and a shopping list built from what you've planned. One hundred and two dinners, planner, recipe library with search and filters, and a shopping list that scales to how many people you're cooking for.

This is a static site (plain HTML, CSS and JavaScript, no build step), so it can be published directly on GitHub Pages. Sign in with Google is optional: without it the app still works fully, saving everything to the browser you're using. With it turned on, your weekly plan, servings setting and shopping list sync across every device you sign into.

## Files

- `index.html`, `styles.css`, `app.js`: the app itself.
- `firebase-config.js`: where you paste your own Firebase project's settings. Ships with placeholder values, so the app runs locally-only until you fill it in.
- This README: setup and deployment steps below.

## 1. Try it with no setup

You can open `index.html` in a browser right away (or publish it as-is) and everything works, saved to that browser's local storage only. Do the Firebase setup below only when you want Google sign-in and cross-device sync.

## 2. Publish on GitHub Pages

1. Create a new GitHub repository (public or private both work with Pages).
2. Add these five files to it and push to the `main` branch.
3. In the repository, go to **Settings > Pages**.
4. Under **Build and deployment**, set **Source** to "Deploy from a branch", branch `main`, folder `/ (root)`.
5. Save. GitHub gives you a URL, usually `https://<your-username>.github.io/<repo-name>/`. It can take a minute or two to go live the first time.

## 3. Set up Google sign-in and sync (optional)

This uses Firebase, Google's free backend for exactly this kind of thing (auth plus a small database). The free tier is far more than this app needs.

### Create the Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add project**. Name it anything (e.g. "plate-and-list") and finish the wizard (you can leave Google Analytics off).
2. In the project, click the **web** icon (`</>`) to register a web app. Give it a nickname; you don't need Firebase Hosting.
3. Firebase shows you a `firebaseConfig` object. Copy the values into `firebase-config.js` in this project, replacing the `YOUR_...` placeholders. This config is not a secret and is fine to commit to a public repo; it just points the app at your project.

### Turn on Google sign-in

1. In the Firebase console, go to **Build > Authentication**.
2. Click **Get started**, then open the **Sign-in method** tab.
3. Click **Google**, toggle it **Enable**, pick a support email, and **Save**.

### Create the database

1. Go to **Build > Firestore Database** and click **Create database**.
2. Choose a location close to you and start in **production mode** (the security rules below lock it down properly).

### Set security rules

Each signed-in user should only be able to read or write their own data. In the Firestore console, open the **Rules** tab and replace the contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/planner/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **Publish**. This is what actually protects your data; the config file being public is fine because of this rule.

### Allow your GitHub Pages domain to sign in

1. In **Authentication > Settings > Authorized domains**, click **Add domain**.
2. Add your GitHub Pages domain, e.g. `<your-username>.github.io`.
3. `localhost` is already allowed by default, so sign-in works while testing locally too.

### Done

Push the updated `firebase-config.js` to your repository (GitHub Pages picks it up automatically on the next deploy). Open the site, click **Sign in with Google**, and your plan will start syncing. Sign into the same Google account on another device and it appears there too.

## About the "secrets detected" email from GitHub

GitHub's scanner flags any string shaped like a Google API key, including this one, but a Firebase web config key isn't a secret in the way a password or a server-side key is: it just tells the SDK which project to talk to, and it's designed to sit in public client-side code. Real protection comes from the Firestore rules above (only a signed-in user can touch their own data) and, optionally, restricting what the key itself can be used for. Worth doing both:

1. In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (same project), find this API key under **Credentials**, open it, and under **Application restrictions** choose **Websites** and add:
   - your GitHub Pages domain, e.g. `your-username.github.io/*`
   - `localhost` for local testing
   - **your Firebase auth domain itself**: `your-project-id.firebaseapp.com/*`

   That last one is easy to miss and breaks Google sign-in if it's left out: the sign-in popup loads a handler page hosted on `<project-id>.firebaseapp.com`, and that page is what actually calls the API with this key, not the page the user started on. Without it allow-listed, sign-in fails with "The requested action is invalid." If you hit that error after restricting the key, this is almost always why; add the auth domain and it clears up immediately (existing open tabs may need a refresh).
2. Under **API restrictions**, limit it to just the APIs this app uses (Identity Toolkit API, Token Service API, Cloud Firestore API, Firebase Installations API) rather than leaving it unrestricted.
3. Back on the GitHub alert, once you're happy with the above, you can dismiss it (as a false positive, or "won't fix") rather than rotating the key, since a fresh key would carry the same "risk" GitHub is flagging.

## How the sync works

- Everything is saved to the browser's local storage immediately, on every change, whether or not you're signed in. This means the app is fully usable offline or without ever setting up Firebase.
- When signed in, changes are also written to Firestore (in a document scoped to your account, under a short delay so rapid changes like ticking off shopping items don't spam the network) and a live listener keeps every open tab or device in sync automatically, no refresh needed.
- Signing out just stops the cloud sync; what's already on the device stays there.
