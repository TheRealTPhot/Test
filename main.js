// main.js
document.addEventListener('DOMContentLoaded', async function () {
  // Import Firebase modules
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js");
  const { getAnalytics, isSupported } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js");
  // You can import Auth, Firestore, etc. similarly as needed

  // Get config from window variable
  const firebaseConfig = JSON.parse(window.__firebase_config);

  // Initialize Firebase app
  const app = initializeApp(firebaseConfig);

  // Initialize Analytics (if supported in this environment)
  if (await isSupported()) {
    getAnalytics(app);
    console.log("Firebase Analytics initialized.");
  } else {
    console.log("Firebase Analytics not supported in this environment.");
  }

  // Example: Show UI when Firebase is ready
  document.getElementById('loading-spinner').classList.add('hidden');
  document.getElementById('main-content').classList.remove('hidden');

  // Now you can add your app logic here, e.g. Auth, Firestore, etc.
  // Example: Log Firebase app instance
  console.log("Firebase connected!", app);
});
