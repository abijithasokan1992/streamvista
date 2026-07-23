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
    const ledgersRef = db.collection("ledgers").where("creatorId", "==", creatorId);
    const snapshot = await ledgersRef.get();

    let available = 0;
    let pending = 0;
    let reserved = 0;
    let settled = 0;

    snapshot.forEach(doc => {
      const entry = doc.data();
      if (entry.type === "creator_payable") {
        if (entry.settlementStatus === "pending") {
          available += entry.amount;
        } else if (entry.settlementStatus === "settled") {
          settled += entry.amount;
        }
      } else if (entry.type === "settlement_requested") {
        // A requested settlement reserves funds
        reserved += entry.amount;
        available -= entry.amount; // Remove from available
      } else if (entry.type === "settlement_paid") {
        // When actually paid, it moves from reserved to settled
        reserved -= entry.amount;
        settled += entry.amount;
      } else if (entry.type === "refund" || entry.type === "reversal") {
        available -= entry.amount;
      }
    });

    return {
      available,
      pending,
      reserved,
      settled
    };

  } catch (error) {
    console.error("Error aggregating wallet:", error);
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
    // 1. Calculate current available balance (similar to getWalletSummary)
    const ledgersRef = db.collection("ledgers").where("creatorId", "==", creatorId);
    const snapshot = await ledgersRef.get();
    
    let available = 0;
    snapshot.forEach(doc => {
      const entry = doc.data();
      if (entry.type === "creator_payable" && entry.settlementStatus === "pending") {
        available += entry.amount;
      } else if (entry.type === "settlement_requested") {
        available -= entry.amount;
      } else if (entry.type === "refund" || entry.type === "reversal") {
        available -= entry.amount;
      }
    });

    // 2. Validate sufficient funds
    if (amount > available) {
      throw new functions.https.HttpsError("failed-precondition", "Insufficient available funds.");
    }

    // 3. Create the settlement request ledger entry (Reserves the funds)
    const ledgerRef = db.collection("ledgers").doc();
    await ledgerRef.set({
      type: "settlement_requested",
      creatorId,
      amount,
      currency: "INR", // Assuming base currency for now
      status: "pending_admin_approval",
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    await createAuditLog("SETTLEMENT_REQUESTED", ledgerRef.id, { amount }, creatorId);

    return { success: true, ledgerId: ledgerRef.id };

  } catch (error) {
    console.error("Error requesting settlement:", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", "Failed to request settlement");
  }
});
