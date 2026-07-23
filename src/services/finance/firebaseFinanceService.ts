import { 
  CommissionConfig, 
  CreatorWallet, 
  Agreement, 
  SettlementRequest 
} from "../../types/finance";
import { db } from "../firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, doc, getDoc, getDocs, setDoc, query, where, updateDoc } from "firebase/firestore";

const functions = getFunctions();

export const firebaseFinanceService = {
  // Configuration
  async getCommissionConfig(): Promise<CommissionConfig> {
    const docRef = doc(db, "settings", "finance");
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      return {
        id: "global",
        freeCreatorCommissionPercent: 35,
        storageBillingRatePerGb: 0.05,
        qcServiceFee: 150.00,
        updatedAt: new Date().toISOString(),
        updatedBy: "system"
      };
    }
    return snapshot.data() as CommissionConfig;
  },

  async updateCommissionConfig(config: Partial<CommissionConfig>, adminId: string): Promise<CommissionConfig> {
    const docRef = doc(db, "settings", "finance");
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy: adminId
    }, { merge: true });
    return this.getCommissionConfig();
  },

  // Wallets (Backend authoritative)
  async getCreatorWallet(creatorId: string): Promise<CreatorWallet> {
    const getWalletSummary = httpsCallable(functions, "getWalletSummary");
    const response = await getWalletSummary();
    const data = response.data as any;
    
    return {
      creatorId,
      availableBalance: data.available || 0,
      pendingBalance: data.pending || 0,
      totalEarned: (data.available || 0) + (data.settled || 0) + (data.reserved || 0),
      lastUpdated: new Date().toISOString()
    };
  },

  // Agreements
  async createAgreement(titleId: string, buyerId: string, creatorId: string, agreedPrice: number): Promise<Agreement> {
    const id = `agr_${Date.now()}`;
    const agreement: Agreement = {
      id,
      titleId,
      buyerId,
      creatorId,
      agreedPrice,
      currency: "INR",
      status: "draft",
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, "agreements", id), agreement);
    return agreement;
  },

  async getAgreements(userId: string, role: string): Promise<Agreement[]> {
    if (role === "admin" || role === "super_admin" || role === "platform_owner") {
      const q = query(collection(db, "agreements"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Agreement);
    } else {
      // Buyer or Creator
      const qBuyer = query(collection(db, "agreements"), where("buyerId", "==", userId));
      const qCreator = query(collection(db, "agreements"), where("creatorId", "==", userId));
      
      const [buyerSnap, creatorSnap] = await Promise.all([getDocs(qBuyer), getDocs(qCreator)]);
      const agreements = [...buyerSnap.docs, ...creatorSnap.docs].map(doc => doc.data() as Agreement);
      
      // Remove duplicates if a user is somehow both
      const unique = Array.from(new Map(agreements.map(item => [item.id, item])).values());
      return unique;
    }
  },

  // Settlements (Backend authoritative)
  async requestSettlement(creatorId: string, amount: number): Promise<SettlementRequest> {
    const requestSettlementFn = httpsCallable(functions, "requestSettlement");
    const response = await requestSettlementFn({ amount });
    const data = response.data as any;
    
    if (!data.success) {
      throw new Error("Settlement request failed on backend");
    }

    return {
      id: data.ledgerId,
      creatorId,
      amount,
      status: "pending",
      requestedAt: new Date().toISOString()
    };
  }
};
