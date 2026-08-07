import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

declare const process: { env: Record<string, string | undefined> };

const env: Record<string, string | boolean | undefined> =
  typeof import.meta !== "undefined" && import.meta?.env
    ? (import.meta.env as Record<string, string | boolean | undefined>)
    : typeof process !== "undefined" && process?.env
      ? process.env
      : {};

const isTest = env.MODE === "test" || env.NODE_ENV === "test";
const useEmulator = env.VITE_USE_FIREBASE_EMULATOR === "true" || isTest;

const requiredConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(requiredConfig)
  .filter(([, value]) => typeof value !== "string" || value.trim() === "")
  .map(([key]) => key);

if (missingConfig.length > 0 && !useEmulator) {
  throw new Error(
    `Firebase production configuration is incomplete: ${missingConfig.join(", ")}. ` +
      "Refusing to start with demo or fallback credentials."
  );
}

const firebaseConfig = useEmulator
  ? {
      apiKey: "emulator-only-key",
      authDomain: "localhost",
      projectId: "streamvista-test",
      storageBucket: "streamvista-test.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:emulator",
    }
  : (requiredConfig as Record<string, string>);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

if (useEmulator) {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  } catch {
    // Firebase SDK throws if an emulator was already connected in this process.
  }
}

export { app, auth, db, storage, functions };
