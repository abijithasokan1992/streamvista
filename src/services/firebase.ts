import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { logger } from "../utils/logger";

const firebaseConfig = {
  // Safe dummy values for Emulator connection
  apiKey: "demo-api-key",
  authDomain: "demo-streamvista.firebaseapp.com",
  projectId: "demo-streamvista",
  storageBucket: "demo-streamvista.appspot.com",
  messagingSenderId: "000000000",
  appId: "1:000000000:web:000000000"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to Local Emulators if in Dev Mode
if (import.meta.env.DEV) {
  logger.info("Initializing Firebase SDK against Local Emulators...");
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}

export { app, auth, db, storage };
