"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestSettlement = exports.getWalletSummary = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const auditLog_1 = require("./utils/auditLog");
exports.getWalletSummary = functions.https.onCall(async (data, context) => {
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
        const w = walletSnap.data();
        return {
            available: w.availableBalance || 0,
            pending: w.pendingBalance || 0,
            reserved: w.reservedBalance || 0,
            settled: w.settledBalance || 0,
            totalEarned: w.totalEarned || 0
        };
    }
    catch (error) {
        console.error("Error fetching wallet summary:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch wallet summary");
    }
});
exports.requestSettlement = functions.https.onCall(async (data, context) => {
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
        await (0, auditLog_1.createAuditLog)("SETTLEMENT_REQUESTED", newLedgerId, { amount }, creatorId);
        return { success: true, ledgerId: newLedgerId };
    }
    catch (error) {
        console.error("Error requesting settlement:", error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError("internal", "Failed to request settlement");
    }
});
//# sourceMappingURL=finance.js.map