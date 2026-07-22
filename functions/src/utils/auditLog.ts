import * as admin from "firebase-admin";

// Initialize admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export type AuditLogAction = 
  | "PAYMENT_ORDER_CREATED"
  | "PAYMENT_WEBHOOK_RECEIVED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED";

export interface AuditLogEntry {
  action: AuditLogAction;
  resourceId: string;
  userId?: string;
  details: Record<string, any>;
  timestamp: admin.firestore.FieldValue;
}

export async function createAuditLog(
  action: AuditLogAction, 
  resourceId: string, 
  details: Record<string, any>, 
  userId?: string
): Promise<void> {
  try {
    const entry: AuditLogEntry = {
      action,
      resourceId,
      userId,
      details,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("auditLogs").add(entry);
    console.log(`Audit log created: ${action} for ${resourceId}`);
  } catch (error) {
    console.error("Failed to create audit log", error);
    // Don't throw - audit log failure shouldn't fail the main transaction
  }
}
