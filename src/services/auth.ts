import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseReady } from './firebase';
import { getUser, setFallbackUsers, getFallbackUsers } from './users';
import { mapFirebaseError } from './errors';
import { safeStorage } from './storage';
import type { RegisterInput, Result, User } from '@/types';
import { createId } from '@/utils/id';

const FALLBACK_AUTH_KEY = '@rawuh_fallback_current_user_id';

let fallbackCurrentUser: User | null = null;
const fallbackAuthListeners = new Set<(user: User | null) => void>();

export async function register(input: RegisterInput): Promise<Result<User>> {
  if (!isFirebaseReady || !auth || !db) {
    // Mode Fallback
    const existing = getFallbackUsers().find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      return { ok: false, code: 'CONFLICT', message: 'Email sudah terdaftar' };
    }

    if (input.role === 'asisten' && input.inviteCode !== 'LAB-RAWUH-2026') {
      return { ok: false, code: 'PERMISSION_DENIED', message: 'Kode undangan asisten tidak sesuai' };
    }

    const newUser: User = {
      id: createId('usr'),
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      role: input.role,
      kelas: input.role === 'praktikan' ? input.kelas : undefined,
    };

    const updated = [...getFallbackUsers(), newUser];
    setFallbackUsers(updated);
    fallbackCurrentUser = newUser;
    await safeStorage.setItem(FALLBACK_AUTH_KEY, newUser.id);
    notifyFallbackAuth(newUser);

    return { ok: true, data: newUser };
  }

  // Firebase Real
  try {
    const cred = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
    const uid = cred.user.uid;

    const profileData: Record<string, unknown> = {
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      role: input.role,
      createdAt: serverTimestamp(),
    };

    if (input.role === 'praktikan' && input.kelas) {
      profileData.kelas = input.kelas;
    }
    if (input.role === 'asisten' && input.inviteCode) {
      profileData.inviteCode = input.inviteCode.trim();
    }

    try {
      await setDoc(doc(db, 'users', uid), profileData);
    } catch (dbError) {
      // Rollback pembuatan akun auth bila dokumen profile gagal dibuat (FR-13)
      try {
        await cred.user.delete();
      } catch {
        // Abaikan error rollback
      }

      const mapped = mapFirebaseError(dbError);
      if (mapped.code === 'PERMISSION_DENIED' && input.role === 'asisten') {
        return {
          ok: false,
          code: 'PERMISSION_DENIED',
          message: 'Kode undangan asisten tidak sesuai',
        };
      }
      return { ok: false, code: mapped.code, message: mapped.message };
    }

    const createdUser: User = {
      id: uid,
      name: input.name.trim(),
      email: input.email.toLowerCase().trim(),
      role: input.role,
      kelas: input.kelas,
    };

    return { ok: true, data: createdUser };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}

export async function login(email: string, password: string): Promise<Result<User>> {
  if (!isFirebaseReady || !auth || !db) {
    // Mode Fallback
    const user = getFallbackUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
    );

    if (!user) {
      return { ok: false, code: 'INVALID_INPUT', message: 'Email atau kata sandi salah' };
    }

    fallbackCurrentUser = user;
    await safeStorage.setItem(FALLBACK_AUTH_KEY, user.id);
    notifyFallbackAuth(user);

    return { ok: true, data: user };
  }

  // Firebase Real
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await getUser(cred.user.uid);

    if (!profile) {
      await signOut(auth);
      return {
        ok: false,
        code: 'NOT_FOUND',
        message: 'Profil pengguna tidak ditemukan. Hubungi administrator.',
      };
    }

    return { ok: true, data: profile };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}

export async function logout(): Promise<void> {
  if (!isFirebaseReady || !auth) {
    fallbackCurrentUser = null;
    await safeStorage.removeItem(FALLBACK_AUTH_KEY);
    notifyFallbackAuth(null);
    return;
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.error('[services/auth] logout error:', error);
  }
}

export function observeAuth(onUser: (user: User | null) => void): () => void {
  if (!isFirebaseReady || !auth) {
    // Jalankan cek persisten fallback dari safeStorage
    safeStorage.getItem(FALLBACK_AUTH_KEY).then((savedUid) => {
      if (savedUid) {
        const found = getFallbackUsers().find((u) => u.id === savedUid) ?? null;
        fallbackCurrentUser = found;
        onUser(found);
      } else {
        onUser(null);
      }
    });

    fallbackAuthListeners.add(onUser);
    return () => {
      fallbackAuthListeners.delete(onUser);
    };
  }

  const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      onUser(null);
      return;
    }

    try {
      const profile = await getUser(fbUser.uid);
      if (!profile) {
        // FR-16: Profil tidak ditemukan di Firestore, logout pengguna
        await signOut(auth!);
        onUser(null);
      } else {
        onUser(profile);
      }
    } catch {
      onUser(null);
    }
  });

  return unsubscribe;
}

function notifyFallbackAuth(user: User | null) {
  fallbackAuthListeners.forEach((listener) => {
    try {
      listener(user);
    } catch {
      // Abaikan error di callback
    }
  });
}
