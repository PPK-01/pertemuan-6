import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase';
import { mapFirebaseError } from './errors';
import { dummyKelasPraktikum } from '@/data/dummy';
import type { KelasPraktikum, Result } from '@/types';
import { createId } from '@/utils/id';

let inMemoryKelas: KelasPraktikum[] = [...dummyKelasPraktikum];

export function listenKelas(
  onData: (list: KelasPraktikum[]) => void,
  onError?: (err: Error) => void,
): () => void {
  if (!isFirebaseReady || !db) {
    onData(inMemoryKelas);
    return () => {};
  }

  const unsubscribe = onSnapshot(
    collection(db, 'kelasPraktikum'),
    (snapshot) => {
      const list: KelasPraktikum[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          praktikum: data.praktikum,
          kelas: data.kelas,
          createdBy: data.createdBy,
        };
      });
      onData(list);
    },
    (error) => {
      console.error('[services/kelas] listenKelas error:', error);
      if (onError) onError(error);
    },
  );

  return unsubscribe;
}

export async function addKelas(
  praktikum: string,
  kelas: string,
  userId: string,
): Promise<Result<KelasPraktikum>> {
  const p = praktikum.trim();
  const k = kelas.trim().toUpperCase();

  if (!isFirebaseReady || !db) {
    const exists = inMemoryKelas.some(
      (item) => item.praktikum.toLowerCase() === p.toLowerCase() && item.kelas === k,
    );
    if (exists) {
      return { ok: false, code: 'CONFLICT', message: 'Pasangan praktikum dan kelas sudah ada' };
    }
    const newK: KelasPraktikum = {
      id: createId('kp'),
      praktikum: p,
      kelas: k,
      createdBy: userId,
    };
    inMemoryKelas = [...inMemoryKelas, newK];
    return { ok: true, data: newK };
  }

  try {
    // Cek duplikasi pasangan
    const q = query(
      collection(db, 'kelasPraktikum'),
      where('praktikum', '==', p),
      where('kelas', '==', k),
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      return { ok: false, code: 'CONFLICT', message: 'Pasangan praktikum dan kelas sudah ada' };
    }

    const newId = createId('kp');
    const docRef = doc(db, 'kelasPraktikum', newId);
    await setDoc(docRef, {
      praktikum: p,
      kelas: k,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ok: true,
      data: { id: newId, praktikum: p, kelas: k, createdBy: userId },
    };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}

export async function updateKelas(
  id: string,
  praktikum: string,
  kelas: string,
): Promise<Result> {
  const p = praktikum.trim();
  const k = kelas.trim().toUpperCase();

  if (!isFirebaseReady || !db) {
    inMemoryKelas = inMemoryKelas.map((item) =>
      item.id === id ? { ...item, praktikum: p, kelas: k } : item,
    );
    return { ok: true, data: undefined };
  }

  try {
    const docRef = doc(db, 'kelasPraktikum', id);
    await updateDoc(docRef, {
      praktikum: p,
      kelas: k,
      updatedAt: serverTimestamp(),
    });
    return { ok: true, data: undefined };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}

export async function deleteKelas(id: string): Promise<Result> {
  if (!isFirebaseReady || !db) {
    inMemoryKelas = inMemoryKelas.filter((item) => item.id !== id);
    return { ok: true, data: undefined };
  }

  try {
    const docRef = doc(db, 'kelasPraktikum', id);
    await deleteDoc(docRef);
    return { ok: true, data: undefined };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}
