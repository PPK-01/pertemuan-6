import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase';
import { connectionService } from './connection';
import { dummyAttendances, dummySessionCodes } from '@/data/dummy';
import type { Attendance, AttendResult, Session, User } from '@/types';

let inMemoryAttendances: Attendance[] = [...dummyAttendances];

export function listenAttendances(
  user: User,
  onData: (attendances: Attendance[]) => void,
  onError?: (err: Error) => void,
): () => void {
  if (!isFirebaseReady || !db) {
    const list =
      user.role === 'asisten'
        ? inMemoryAttendances
        : inMemoryAttendances.filter((a) => a.userId === user.id);
    onData(list);
    return () => {};
  }

  const collRef = collection(db, 'attendances');
  const q =
    user.role === 'asisten'
      ? query(collRef)
      : query(collRef, where('userId', '==', user.id));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: Attendance[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          sessionId: data.sessionId,
          userId: data.userId,
          kelas: data.kelas,
          code: data.code,
          timestamp: typeof data.timestamp?.toDate === 'function' ? data.timestamp.toDate().toISOString() : data.timestamp,
        };
      });
      onData(list);
    },
    (error) => {
      console.error('[services/attendance] listenAttendances error:', error);
      if (onError) onError(error);
    },
  );

  return unsubscribe;
}

export async function submitAttendance(
  sessionId: string,
  user: User,
  code: string,
  session: Session,
): Promise<AttendResult> {
  // 1. Pra-cek koneksi (FR-29, SRS 4.3)
  if (!connectionService.isConnected) {
    return { ok: false, reason: 'NO_CONNECTION' };
  }

  // 2. Pra-cek sesi & kelas
  if (session.status !== 'open') {
    return { ok: false, reason: 'SESSION_NOT_OPEN' };
  }
  if (!user.kelas || user.kelas !== session.kelas) {
    return { ok: false, reason: 'NOT_IN_CLASS' };
  }

  const attendanceId = `${sessionId}_${user.id}`;

  if (!isFirebaseReady || !db) {
    // Mode Fallback
    const already = inMemoryAttendances.some((a) => a.id === attendanceId);
    if (already) {
      return { ok: false, reason: 'ALREADY_ATTENDED' };
    }

    const expectedCode = dummySessionCodes[sessionId];
    if (expectedCode && expectedCode !== code.trim()) {
      return { ok: false, reason: 'INVALID_CODE' };
    }

    const att: Attendance = {
      id: attendanceId,
      sessionId,
      userId: user.id,
      kelas: user.kelas,
      timestamp: new Date().toISOString(),
    };
    inMemoryAttendances = [...inMemoryAttendances, att];
    return { ok: true, attendance: att };
  }

  // Firebase Real dengan batas timeout 10 detik (SRS 4.3)
  const timeoutPromise = new Promise<AttendResult>((resolve) => {
    setTimeout(() => {
      resolve({ ok: false, reason: 'TIMEOUT' });
    }, 10000);
  });

  const executionPromise = (async (): Promise<AttendResult> => {
    try {
      const attRef = doc(db, 'attendances', attendanceId);
      await setDoc(attRef, {
        sessionId,
        userId: user.id,
        kelas: user.kelas,
        code: code.trim(),
        timestamp: serverTimestamp(),
      });

      const att: Attendance = {
        id: attendanceId,
        sessionId,
        userId: user.id,
        kelas: user.kelas,
        timestamp: new Date().toISOString(),
      };
      return { ok: true, attendance: att };
    } catch (err: unknown) {
      const errObj = err as { code?: string; message?: string };

      if (errObj.code === 'permission-denied') {
        // Cek apakah sesi baru saja ditutup
        try {
          const freshSessionDoc = await getDoc(doc(db, 'sessions', sessionId));
          if (freshSessionDoc.exists() && freshSessionDoc.data().status !== 'open') {
            return { ok: false, reason: 'SESSION_NOT_OPEN' };
          }
        } catch {
          // Abaikan error re-fetch
        }

        // Cek apakah izin sudah disetujui
        try {
          const izinDoc = await getDoc(doc(db, 'izin', attendanceId));
          if (izinDoc.exists() && izinDoc.data().status === 'approved') {
            return { ok: false, reason: 'IZIN_APPROVED' };
          }
        } catch {
          // Abaikan
        }

        return { ok: false, reason: 'INVALID_CODE' };
      }

      if (errObj.code === 'already-exists') {
        return { ok: false, reason: 'ALREADY_ATTENDED' };
      }

      return { ok: false, reason: 'UNKNOWN' };
    }
  })();

  return Promise.race([executionPromise, timeoutPromise]);
}
