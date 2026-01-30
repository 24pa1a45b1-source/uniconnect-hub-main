// Firebase initialization (lazy/dynamic imports)
import type { FirebaseApp } from 'firebase/app';
import type { Analytics } from 'firebase/analytics';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';

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

function hasConfig(cfg: Record<string, unknown>) {
  return Object.values(cfg).every((v) => typeof v === 'string' && (v as string).length > 0);
}

let app: FirebaseApp | undefined;
let analytics: Analytics | null = null;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let initialized = false;

export async function initFirebase() {
  if (initialized) return { app, analytics, auth, db, storage };
  if (!hasConfig(firebaseConfig)) {
    console.warn('Firebase config is missing or incomplete. Set VITE_FIREBASE_* env variables.');
    return { app, analytics, auth, db, storage };
  }

  try {
    const { initializeApp } = await import('firebase/app');
    const { getAnalytics } = await import('firebase/analytics');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');

    app = initializeApp(firebaseConfig as Record<string, string>);
    try { analytics = typeof window !== 'undefined' ? getAnalytics(app) : null; } catch (e) { analytics = null; }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    initialized = true;
  } catch (error) {
    console.warn('Firebase initialization error:', error);
  }

  return { app, analytics, auth, db, storage };
}

export { app, analytics, auth, db, storage };
export default app;
