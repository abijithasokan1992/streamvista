import { db } from "./firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const adminService = {
  async getAllUsers() {
    const q = query(collection(db, "users"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  },
  
  async getLedgers() {
    const q = query(collection(db, "ledgers"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async getWallets() {
    const q = query(collection(db, "wallets"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
