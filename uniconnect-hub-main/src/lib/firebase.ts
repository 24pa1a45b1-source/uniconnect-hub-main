// Firebase initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Load config from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function hasConfig(cfg: Record<string, any>) {
  return Object.values(cfg).every((v) => typeof v === 'string' && v.length > 0);
}

let app: any;
let analytics: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

if (hasConfig(firebaseConfig)) {
  try {
    // Initialize Firebase only if config is complete
    app = initializeApp(firebaseConfig as any);

    // Analytics only available in browser
    analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase config is missing or incomplete. Set VITE_FIREBASE_* env variables.');
}

export { app, analytics, auth, db, storage };
export default app;
