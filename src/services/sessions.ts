import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseReady } from './firebase';
import { mapFirebaseError } from './errors';
import { dummySessionCodes, dummySessions } from '@/data/dummy';
import type { CreateSessionInput, Result, Session, User } from '@/types';
import { createId, createSessionCode } from '@/utils/id';

let inMemorySessions: Session[] = [...dummySessions];
let inMemoryCodes: Record<string, string> = { ...dummySessionCodes };

export function listenSessions(
  user: User,
  onData: (sessions: Session[]) => void,
  onError?: (err: Error) => void,
): () => void {
  if (!isFirebaseReady || !db) {
    const filtered =
      user.role === 'asisten'
        ? inMemorySessions
        : inMemorySessions.filter((s) => s.kelas === user.kelas);
    onData(filtered);
    return () => {};
  }

  const sessionsRef = collection(db, 'sessions');
  const q =
    user.role === 'asisten'
      ? query(sessionsRef)
      : query(sessionsRef, where('kelas', '==', user.kelas ?? ''));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const list: Session[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          praktikum: data.praktikum,
          kelas: data.kelas,
          topik: data.topik,
          ruang: data.ruang,
          startAt: typeof data.startAt?.toDate === 'function' ? data.startAt.toDate().toISOString() : data.startAt,
          endAt: typeof data.endAt?.toDate === 'function' ? data.endAt.toDate().toISOString() : data.endAt,
          status: data.status,
          createdBy: data.createdBy,
          openedAt: typeof data.openedAt?.toDate === 'function' ? data.openedAt.toDate().toISOString() : data.openedAt,
          closedAt: typeof data.closedAt?.toDate === 'function' ? data.closedAt.toDate().toISOString() : data.closedAt,
        };
      });
      onData(list);
    },
    (error) => {
      console.error('[services/sessions] listenSessions error:', error);
      if (onError) onError(error);
    },
  );

  return unsubscribe;
}

export async function createSession(input: CreateSessionInput): Promise<Result<Session>> {
  const sessionId = createId('ses');
  const code = createSessionCode();

  if (!isFirebaseReady || !db) {
    const newSession: Session = {
      id: sessionId,
      ...input,
      status: 'scheduled',
    };
    inMemorySessions = [...inMemorySessions, newSession];
    inMemoryCodes[sessionId] = code;
    return { ok: true, data: newSession };
  }

  try {
    const batch = writeBatch(db);

    const sessionRef = doc(db, 'sessions', sessionId);
    batch.set(sessionRef, {
      ...input,
      status: 'scheduled',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const codeRef = doc(db, 'sessions', sessionId, 'private', 'code');
    batch.set(codeRef, { code });

    await batch.commit();

    const created: Session = {
      id: sessionId,
      ...input,
      status: 'scheduled',
    };
    return { ok: true, data: created };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}

export async function updateSession(
  id: string,
  patch: Partial<Session>,
): Promise<Result> {
  if (!isFirebaseReady || !db) {
    inMemorySessions = inMemorySessions.map((s) => (s.id === id ? { ...s, ...patch } : s));
    return { ok: true, data: undefined };
  }

  try {
    const sessionRef = doc(db, 'sessions', id);
    const cleanPatch: Record<string, unknown> = {
      ...patch,
      updatedAt: serverTimestamp(),
    };
    delete cleanPatch.id;
    delete cleanPatch.createdAt;

    const batch = writeBatch(db);
    batch.update(sessionRef, cleanPatch);
    await batch.commit();

    return { ok: true, data: undefined };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}

export async function setStatus(
  id: string,
  status: 'open' | 'closed',
): Promise<Result> {
  const now = new Date().toISOString();

  if (!isFirebaseReady || !db) {
    inMemorySessions = inMemorySessions.map((s) => {
      if (s.id !== id) return s;
      return status === 'open'
        ? { ...s, status: 'open', openedAt: now }
        : { ...s, status: 'closed', closedAt: now };
    });
    return { ok: true, data: undefined };
  }

  try {
    const sessionRef = doc(db, 'sessions', id);
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === 'open') {
      updateData.openedAt = serverTimestamp();
    } else {
      updateData.closedAt = serverTimestamp();
    }

    const batch = writeBatch(db);
    batch.update(sessionRef, updateData);
    await batch.commit();

    return { ok: true, data: undefined };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}

export async function deleteSession(id: string): Promise<Result> {
  if (!isFirebaseReady || !db) {
    inMemorySessions = inMemorySessions.filter((s) => s.id !== id);
    delete inMemoryCodes[id];
    return { ok: true, data: undefined };
  }

  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'sessions', id, 'private', 'code'));
    batch.delete(doc(db, 'sessions', id));
    await batch.commit();

    return { ok: true, data: undefined };
  } catch (error) {
    const mapped = mapFirebaseError(error);
    return { ok: false, code: mapped.code, message: mapped.message };
  }
}

export async function getSessionCode(sessionId: string): Promise<string | null> {
  if (!isFirebaseReady || !db) {
    return inMemoryCodes[sessionId] ?? null;
  }

  try {
    const codeDoc = await getDoc(doc(db, 'sessions', sessionId, 'private', 'code'));
    if (!codeDoc.exists()) return null;
    return codeDoc.data()?.code ?? null;
  } catch (error) {
    console.error('[services/sessions] getSessionCode error:', error);
    return null;
  }
}
