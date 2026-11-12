import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { Platform } from 'react-native';
import { env } from '@/config/env';
import { safeStorage } from './storage';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isFirebaseReady = false;

if (env.firebase.isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(env.firebase);

    if (Platform.OS === 'web') {
      auth = getAuth(app);
    } else {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const authPkg = require('@firebase/auth');
        const getPersistence = authPkg.getReactNativePersistence;
        if (typeof getPersistence === 'function') {
          auth = initializeAuth(app, {
            persistence: getPersistence(safeStorage),
          });
        } else {
          auth = getAuth(app);
        }
      } catch {
        auth = getAuth(app);
      }
    }

    db = getFirestore(app);
    isFirebaseReady = true;
  } catch (error) {
    console.warn('[Firebase] Gagal inisialisasi SDK, beralih ke Fallback Engine:', error);
    isFirebaseReady = false;
  }
} else {
  // Mode offline / fallback in-memory (sebelum variabel env dimasukkan pengguna)
  isFirebaseReady = false;
}

export { app, auth, db, isFirebaseReady };
