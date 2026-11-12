import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase';
import { connectionService } from './connection';
import { classifyIzin } from './ai';
import { mapFirebaseError } from './errors';
import type { AiResult, Izin, Result, Session, User } from '@/types';

let inMemoryIzin: Izin[] = [];

export function listenIzin(
  user: User,
  onData: (izinList: Izin[]) => void,
  onError?: (err: Error) => void,
): () => void {
  if (!isFirebaseReady || !db) {
    const list =
      user.role === 'asisten'
        ? inMemoryIzin
        : inMemoryIzin.filter((i) => i.userId === user.id);
    onData(list);
    return () => {};
  }

  const collRef = collection(db, 'izin');
  const q =
    user.role === 'asisten'
      ? query(collRef)
      : query(collRef, where('userId', '==', user.id));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: Izin[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          sessionId: data.sessionId,
          userId: data.userId,
          userName: data.userName,
          kelas: data.kelas,
          alasan: data.alasan,
          status: data.status,
          ai: data.ai,
          review: data.review,
          createdAt: typeof data.createdAt?.toDate === 'function' ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: typeof data.updatedAt?.toDate === 'function' ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        };
      });
      onData(list);
    },
    (error) => {
      console.error('[services/izin] listenIzin error:', error);
      if (onError) onError(error);
    },
  );

  return unsubscribe;
}

export async function submitIzin(
  sessionId: string,
  user: User,
  alasan: string,
  session: Session,
): Promise<Result<Izin>> {
  if (!connectionService.isConnected) {
    return { ok: false, code: 'NO_CONNECTION', message: 'Tidak ada koneksi. Pengajuan izin memerlukan internet' };
  }

  const trimmedAlasan = alasan.trim();
  if (trimmedAlasan.length < 10 || trimmedAlasan.length > 500) {
    return { ok: false, code: 'INVALID_INPUT', message: 'Alasan izin harus antara 10 hingga 500 karakter' };
  }

  const izinId = `${sessionId}_${user.id}`;
  const now = new Date().toISOString();

  const initialIzin: Izin = {
    id: izinId,
    sessionId,
    userId: user.id,
    userName: user.name,
    kelas: user.kelas ?? '',
    alasan: trimmedAlasan,
    status: 'pending_ai',
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseReady || !db) {
    // Mode Fallback
    inMemoryIzin = [...inMemoryIzin.filter((i) => i.id !== izinId), initialIzin];

    // Trigger AI secara asinkron
    classifyIzin({
      praktikum: session.praktikum,
      topik: session.topik,
      tanggalSesi: session.startAt,
      alasan: trimmedAlasan,
    }).then((aiResult) => {
      inMemoryIzin = inMemoryIzin.map((i) =>
        i.id === izinId
          ? { ...i, status: 'pending_review', ai: aiResult, updatedAt: new Date().toISOString() }
          : i,
      );
    });

    return { ok: true, data: initialIzin };
  }

  // Firebase Real dengan simpan pending_ai lalu jalankan AI
  try {
    const docRef = doc(db, 'izin', izinId);
    await setDoc(docRef, {
      sessionId,
      userId: user.id,
      userName: user.name,
      kelas: user.kelas ?? '',
      alasan: trimmedAlasan,
      status: 'pending_ai',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Panggil AI (FR-23)
    classifyIzin({
      praktikum: session.praktikum,
      topik: session.topik,
      tanggalSesi: session.startAt,
      alasan: trimmedAlasan,
    }).then(async (aiResult) => {
      try {
        await updateDoc(docRef, {
          status: 'pending_review',
          ai: aiResult,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('[services/izin] Gagal update AI result ke Firestore:', err);
      }
    });

    return { ok: true, data: initialIzin };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}

export async function saveAiResult(izinId: string, aiResult: AiResult): Promise<Result> {
  if (!isFirebaseReady || !db) {
    inMemoryIzin = inMemoryIzin.map((i) =>
      i.id === izinId
        ? { ...i, status: 'pending_review', ai: aiResult, updatedAt: new Date().toISOString() }
        : i,
    );
    return { ok: true, data: undefined };
  }

  try {
    const docRef = doc(db, 'izin', izinId);
    await updateDoc(docRef, {
      status: 'pending_review',
      ai: aiResult,
      updatedAt: serverTimestamp(),
    });
    return { ok: true, data: undefined };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}

export async function reviewIzin(
  izinId: string,
  asistenId: string,
  keputusan: 'approved' | 'rejected',
  catatan?: string,
): Promise<Result> {
  const now = new Date().toISOString();

  if (!isFirebaseReady || !db) {
    inMemoryIzin = inMemoryIzin.map((i) => {
      if (i.id !== izinId) return i;
      return {
        ...i,
        status: keputusan,
        review: {
          keputusan,
          catatan: catatan?.trim() || undefined,
          reviewedBy: asistenId,
          reviewedAt: now,
        },
        updatedAt: now,
      };
    });
    return { ok: true, data: undefined };
  }

  try {
    const docRef = doc(db, 'izin', izinId);
    await updateDoc(docRef, {
      status: keputusan,
      review: {
        keputusan,
        catatan: catatan?.trim() || null,
        reviewedBy: asistenId,
        reviewedAt: now,
      },
      updatedAt: serverTimestamp(),
    });
    return { ok: true, data: undefined };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}
