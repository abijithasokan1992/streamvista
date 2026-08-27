import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9IcBXb2sRlxnkyU_hFFf5ChR67HZcoBg",
  authDomain: "streamvista-5ac1f.firebaseapp.com",
  projectId: "streamvista-5ac1f",
  storageBucket: "streamvista-5ac1f.firebasestorage.app",
  messagingSenderId: "693450790867",
  appId: "1:693450790867:web:573be88a0946b9a73c4126",
  measurementId: "G-JQHNV6NMSE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
