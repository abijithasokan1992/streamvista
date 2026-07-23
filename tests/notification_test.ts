import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, collection, doc, setDoc, getDocs, updateDoc } from "firebase/firestore";
import { firebaseDatabaseService } from "../src/services/database/firebaseDatabaseService";
import { notificationService } from "../src/services/notifications/firebaseNotificationService";

const firebaseConfig = {
  projectId: "demo-streamvista",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
connectFirestoreEmulator(db, '127.0.0.1', 8080);

// We need to inject the db into the services because they use their own instance normally.
// But since they just import `db` from firebase.ts, we can just let them initialize it and connect to emulator.
// Actually, `src/services/firebase.ts` connects to the emulator automatically if VITE_USE_FIREBASE_EMULATOR is true!
// Let's set process.env.VITE_USE_FIREBASE_EMULATOR="true"
process.env.VITE_USE_FIREBASE_EMULATOR = "true";

async function runTest() {
  console.log("Setting up mock title...");
  const creatorId = "test_creator_123";
  const titleId = "test_title_123";
  
  await setDoc(doc(db, "titles", titleId), {
    title: "Test Title",
    creatorOwnerId: creatorId,
    qcStatus: "pending"
  });

  console.log("Triggering QC Approval via service...");
  await firebaseDatabaseService.updateQCStatus(titleId, "approved");

  // Wait a moment for async notification creation
  await new Promise(r => setTimeout(r, 1000));

  console.log("Fetching notifications for creator...");
  const notifs = await notificationService.getUserNotifications(creatorId);
  
  console.log(`Found ${notifs.length} notifications.`);
  if (notifs.length > 0) {
    console.log("Notification Document Created: ", notifs[0]);
    
    console.log("Marking as read...");
    await notificationService.markAsRead(notifs[0].id);
    
    const notifsAfter = await notificationService.getUserNotifications(creatorId);
    console.log("Notification after marking read: ", notifsAfter[0]);
  } else {
    console.error("No notification found!");
    process.exit(1);
  }
  process.exit(0);
}

runTest().catch(e => {
  console.error(e);
  process.exit(1);
});
