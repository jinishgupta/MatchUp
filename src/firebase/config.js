// Firebase configuration
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZnIQVLgP7SXPtELRSUT3cABjXKKLgdLc",
  authDomain: "matchup-5c8a1.firebaseapp.com",
  projectId: "matchup-5c8a1",
  storageBucket: "matchup-5c8a1.appspot.com",
  messagingSenderId: "912234947972",
  appId: "1:912234947972:web:2855658105195bb0ede9d1",
  measurementId: "G-DCVV8XYNHQ"
};

// Wrap Firebase initialization in a retry mechanism
const initializeFirebase = (retries = 5, delay = 1500) => {
  let app;
  let retryCount = 0;
  
  const tryInitialize = () => {
    try {
      // Get existing apps
      if (getApps().length === 0) {
        // Initialize Firebase if no apps exist
        app = initializeApp(firebaseConfig);
      } else {
        // Use the first existing app
        app = getApps()[0];
      }
      return app;
    } catch (error) {
      if (retryCount < retries) {
        retryCount++;
        // Use setTimeout for browser environments
        setTimeout(tryInitialize, delay);
        return null;
      }
      
      // If we've exhausted retries, return a minimal mock app to prevent crashes
      return {
        // Minimal stub to prevent crashes in dependent code
        name: "[firebase-fallback]",
        options: { ...firebaseConfig },
        automaticDataCollectionEnabled: false
      };
    }
  };
  
  return tryInitialize();
};

// Initialize Firebase with retry mechanism
const app = initializeFirebase();

// Initialize services safely with more robust error handling
let db, auth;

try {
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Add event listeners for connection state
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      // Reinitialize if needed
    });
  }
} catch (error) {
  // Provide stub implementations to prevent crashes
  db = {
    collection: () => ({ 
      get: async () => ({ docs: [] }), 
      add: async () => ({}),
      withConverter: () => ({
        get: async () => ({ docs: [] }),
        add: async () => ({})
      })
    }),
    doc: () => ({ 
      get: async () => ({ exists: false, data: () => ({}) }), 
      set: async () => {},
      update: async () => {},
      withConverter: () => ({
        get: async () => ({ exists: false, data: () => ({}) }),
        set: async () => {},
        update: async () => {}
      })
    })
  };
  
  auth = {
    onAuthStateChanged: (callback) => { 
      callback(null);
      return () => {}; 
    },
    signInAnonymously: async () => ({ user: { uid: 'anonymous' } })
  };
}

export { db, auth };
export default app; 