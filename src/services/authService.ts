import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInAnonymously
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  limit
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { SimulatorUser } from '../types/ios';

// Generate a realistic US simulated phone number format: +1 (555) XXX-XXXX
export function generateSimulatorPhoneNumber(): string {
  const prefix = '555';
  const mid = Math.floor(100 + Math.random() * 900);
  const end = Math.floor(1000 + Math.random() * 9000);
  return `+1 (${prefix}) ${mid}-${end}`;
}

// Clean phone number for matching: remove non-digits
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

class AuthService {
  private googleProvider = new GoogleAuthProvider();

  // Listen to Auth State
  onAuthChange(callback: (user: SimulatorUser | null) => void) {
    return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        callback(null);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as SimulatorUser;
          // Set user to online
          await updateDoc(userDocRef, {
            isOnline: true,
            lastSeen: new Date().toISOString(),
          });
          callback({ ...data, isOnline: true });
        } else {
          // Create initial user profile
          const simPhone = generateSimulatorPhoneNumber();
          const newUser: SimulatorUser = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || `iPhone User ${fbUser.uid.slice(0, 4)}`,
            phoneNumber: simPhone,
            photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${fbUser.uid}`,
            statusMessage: 'Available in Simulator',
            isOnline: true,
            lastSeen: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };

          await setDoc(userDocRef, newUser);
          callback(newUser);
        }
      } catch (err) {
        console.error('Error fetching or creating user profile:', err);
        handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
        callback(null);
      }
    });
  }

  // Google Login (Popup)
  async signInWithGoogle(): Promise<void> {
    try {
      await signInWithPopup(auth, this.googleProvider);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  }

  // Simulated Phone Number OTP Registration / Guest Instant Login
  // Allows testing on different browsers/tabs seamlessly with separate identities!
  async signInWithSimulatorPhone(customName?: string, customPhone?: string): Promise<void> {
    try {
      const cred = await signInAnonymously(auth);
      const uid = cred.user.uid;
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      const simPhone = customPhone || generateSimulatorPhoneNumber();
      const displayName = customName || `iOS User (${simPhone.slice(-4)})`;

      const newUser: SimulatorUser = {
        uid,
        displayName,
        phoneNumber: simPhone,
        photoURL: `https://api.dicebear.com/7.x/notionists/svg?seed=${uid}`,
        statusMessage: 'Hey there! I am using iPhone Simulator.',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      if (!userDoc.exists()) {
        await setDoc(userDocRef, newUser);
      } else {
        await updateDoc(userDocRef, {
          isOnline: true,
          lastSeen: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Simulator Phone Auth failed:', error);
      handleFirestoreError(error, OperationType.WRITE, 'users');
      throw error;
    }
  }

  // Update profile
  async updateProfile(uid: string, updates: Partial<SimulatorUser>): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        ...updates,
        lastSeen: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  }

  // Mark offline on exit
  async setOffline(uid: string): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        isOnline: false,
        lastSeen: new Date().toISOString(),
      });
    } catch {
      // Ignore on page unload
    }
  }

  // Search user by simulated phone number
  async findUserByPhone(phone: string): Promise<SimulatorUser | null> {
    try {
      const usersRef = collection(db, 'users');
      // Look up exact or stripped
      const snapshot = await getDocs(query(usersRef, limit(50)));
      const normQuery = normalizePhoneNumber(phone);

      for (const d of snapshot.docs) {
        const u = d.data() as SimulatorUser;
        if (normalizePhoneNumber(u.phoneNumber) === normQuery) {
          return u;
        }
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return null;
    }
  }

  // Search all registered simulator users (for contacts / calling directory)
  async getAllUsers(excludeUid?: string): Promise<SimulatorUser[]> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(query(usersRef, limit(40)));
      const users: SimulatorUser[] = [];
      snapshot.forEach(docSnap => {
        const u = docSnap.data() as SimulatorUser;
        if (!excludeUid || u.uid !== excludeUid) {
          users.push(u);
        }
      });
      return users;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    if (auth.currentUser) {
      await this.setOffline(auth.currentUser.uid);
    }
    await fbSignOut(auth);
  }
}

export const authService = new AuthService();
