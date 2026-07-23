import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createAuditLog } from "./utils/auditLog";

export const getWalletSummary = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const creatorId = context.auth.uid;
  const db = admin.firestore();

  try {
    const walletRef = db.collection("wallets").doc(creatorId);
    const walletSnap = await walletRef.get();

    if (!walletSnap.exists) {
      return {
        available: 0,
        pending: 0,
        reserved: 0,
        settled: 0,
        totalEarned: 0
      };
    }

    const w = walletSnap.data() as any;
    return {
      available: w.availableBalance || 0,
      pending: w.pendingBalance || 0,
      reserved: w.reservedBalance || 0,
      settled: w.settledBalance || 0,
      totalEarned: w.totalEarned || 0
    };
  } catch (error) {
    console.error("Error fetching wallet summary:", error);
    throw new functions.https.HttpsError("internal", "Failed to fetch wallet summary");
  }
});

export const requestSettlement = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const { amount } = data;
  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid amount.");
  }

  const creatorId = context.auth.uid;
  const db = admin.firestore();

  try {
    let newLedgerId = "";
    
    // Strict transaction to prevent overdrawing
    await db.runTransaction(async (t) => {
      const walletRef = db.collection("wallets").doc(creatorId);
      const walletSnap = await t.get(walletRef);
      
      if (!walletSnap.exists) {
        throw new functions.https.HttpsError("failed-precondition", "Wallet not found or no balance available.");
      }
      
      const currentWallet = walletSnap.data();
      const available = currentWallet?.availableBalance || 0;
      const reserved = currentWallet?.reservedBalance || 0;
      
      if (amount > available) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient available funds.");
      }
      
      // Update wallet
      t.update(walletRef, {
        availableBalance: available - amount,
        reservedBalance: reserved + amount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Create ledger entry
      const ledgerRef = db.collection("ledgers").doc();
      newLedgerId = ledgerRef.id;
      
      t.set(ledgerRef, {
        type: "settlement_requested",
        creatorId,
        amount,
        currency: "INR",
        status: "pending_admin_approval",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await createAuditLog("SETTLEMENT_REQUESTED", newLedgerId, { amount }, creatorId);

    return { success: true, ledgerId: newLedgerId };
  } catch (error) {
    console.error("Error requesting settlement:", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "Failed to request settlement");
  }
});
