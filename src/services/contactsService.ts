import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Contact, CallLog } from '../types/ios';

export class ContactsService {
  // Listen to user's contacts
  static listenContacts(userId: string, callback: (contacts: Contact[]) => void): Unsubscribe {
    const contactsRef = collection(db, 'users', userId, 'contacts');
    const q = query(contactsRef, orderBy('name', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const contacts: Contact[] = [];
      snapshot.forEach((docSnap) => {
        contacts.push({ id: docSnap.id, ...(docSnap.data() as Omit<Contact, 'id'>) });
      });
      callback(contacts);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}/contacts`);
    });
  }

  // Add new contact
  static async addContact(userId: string, contact: Omit<Contact, 'id' | 'userId'>): Promise<string> {
    try {
      const contactsRef = collection(db, 'users', userId, 'contacts');
      const newDoc = doc(contactsRef);
      const payload: Contact = {
        id: newDoc.id,
        userId,
        ...contact,
        isFavorite: contact.isFavorite || false,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(newDoc, payload);
      return newDoc.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/contacts`);
      throw error;
    }
  }

  // Update contact
  static async updateContact(userId: string, contactId: string, updates: Partial<Contact>): Promise<void> {
    try {
      const contactDoc = doc(db, 'users', userId, 'contacts', contactId);
      await updateDoc(contactDoc, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/contacts/${contactId}`);
      throw error;
    }
  }

  // Delete contact
  static async deleteContact(userId: string, contactId: string): Promise<void> {
    try {
      const contactDoc = doc(db, 'users', userId, 'contacts', contactId);
      await deleteDoc(contactDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/contacts/${contactId}`);
      throw error;
    }
  }

  // Call Logs: listen
  static listenCallLogs(userId: string, callback: (logs: CallLog[]) => void): Unsubscribe {
    const logsRef = collection(db, 'users', userId, 'call_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const logs: CallLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push({ id: docSnap.id, ...(docSnap.data() as Omit<CallLog, 'id'>) });
      });
      callback(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}/call_logs`);
    });
  }

  // Add Call Log
  static async addCallLog(userId: string, log: Omit<CallLog, 'id'>): Promise<string> {
    try {
      const logsRef = collection(db, 'users', userId, 'call_logs');
      const newDoc = doc(logsRef);
      const payload: CallLog = {
        id: newDoc.id,
        ...log,
      };
      await setDoc(newDoc, payload);
      return newDoc.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/call_logs`);
      throw error;
    }
  }
}
