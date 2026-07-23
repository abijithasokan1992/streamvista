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
                }
                else if (entry.settlementStatus === "settled") {
                    settled += entry.amount;
                }
            }
            else if (entry.type === "settlement_requested") {
                // A requested settlement reserves funds
                reserved += entry.amount;
                available -= entry.amount; // Remove from available
            }
            else if (entry.type === "settlement_paid") {
                // When actually paid, it moves from reserved to settled
                reserved -= entry.amount;
                settled += entry.amount;
            }
            else if (entry.type === "refund" || entry.type === "reversal") {
                available -= entry.amount;
            }
        });
        return {
            available,
            pending,
            reserved,
            settled
        };
    }
    catch (error) {
        console.error("Error aggregating wallet:", error);
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
        // 1. Calculate current available balance (similar to getWalletSummary)
        const ledgersRef = db.collection("ledgers").where("creatorId", "==", creatorId);
        const snapshot = await ledgersRef.get();
        let available = 0;
        snapshot.forEach(doc => {
            const entry = doc.data();
            if (entry.type === "creator_payable" && entry.settlementStatus === "pending") {
                available += entry.amount;
            }
            else if (entry.type === "settlement_requested") {
                available -= entry.amount;
            }
            else if (entry.type === "refund" || entry.type === "reversal") {
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
        await (0, auditLog_1.createAuditLog)("SETTLEMENT_REQUESTED", ledgerRef.id, { amount }, creatorId);
        return { success: true, ledgerId: ledgerRef.id };
    }
    catch (error) {
        console.error("Error requesting settlement:", error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError("internal", "Failed to request settlement");
    }
});
//# sourceMappingURL=finance.js.map