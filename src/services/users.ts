import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase';
import { dummyUsers } from '@/data/dummy';
import type { User } from '@/types';

// In-Memory store untuk fallback
let inMemoryUsers: User[] = [...dummyUsers];

export function setFallbackUsers(users: User[]) {
  inMemoryUsers = users;
}

export function getFallbackUsers(): User[] {
  return inMemoryUsers;
}

export async function getUser(uid: string): Promise<User | null> {
  if (!isFirebaseReady || !db) {
    return inMemoryUsers.find((u) => u.id === uid) ?? null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return null;
    }
    const data = userDoc.data();
    return {
      id: userDoc.id,
      name: data.name,
      email: data.email,
      role: data.role,
      kelas: data.kelas,
    };
  } catch (error) {
    console.error('[services/users] getUser error:', error);
    return null;
  }
}

export function listenPraktikan(
  onData: (users: User[]) => void,
  onError?: (err: Error) => void,
): () => void {
  if (!isFirebaseReady || !db) {
    const praktikanOnly = inMemoryUsers.filter((u) => u.role === 'praktikan');
    onData(praktikanOnly);
    return () => {};
  }

  const q = query(collection(db, 'users'), where('role', '==', 'praktikan'));
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const users: User[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          email: data.email,
          role: data.role,
          kelas: data.kelas,
        };
      });
      onData(users);
    },
    (error) => {
      console.error('[services/users] listenPraktikan error:', error);
      if (onError) onError(error);
    },
  );

  return unsubscribe;
}
