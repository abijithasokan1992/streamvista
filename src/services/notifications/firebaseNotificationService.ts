import { db } from "../firebase";
import { collection, doc, setDoc, query, where, getDocs, updateDoc } from "firebase/firestore";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "info" | "success" | "warning" | "error";
  link?: string;
}

class FirebaseNotificationService {
  private readonly NOTIFICATIONS_COL = "notifications";

  async createNotification(notification: Omit<AppNotification, "id" | "read" | "createdAt">): Promise<void> {
    const id = `notif-${Date.now()}`;
    const docRef = doc(db, this.NOTIFICATIONS_COL, id);
    
    await setDoc(docRef, {
      ...notification,
      id,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  async getUserNotifications(userId: string): Promise<AppNotification[]> {
    const q = query(
      collection(db, this.NOTIFICATIONS_COL),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => doc.data() as AppNotification);
    
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markAsRead(notificationId: string): Promise<void> {
    const docRef = doc(db, this.NOTIFICATIONS_COL, notificationId);
    await updateDoc(docRef, { read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.getUserNotifications(userId);
    const unread = notifications.filter(n => !n.read);
    
    const promises = unread.map(n => 
      updateDoc(doc(db, this.NOTIFICATIONS_COL, n.id), { read: true })
    );
    
    await Promise.all(promises);
  }
}

export const notificationService = new FirebaseNotificationService();
