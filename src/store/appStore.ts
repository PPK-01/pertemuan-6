import { useMemo } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { dummyAttendances, dummySessions, dummyUsers } from '@/data/dummy';
import type {
  Attendance,
  AttendResult,
  CreateSessionInput,
  Rekap,
  Role,
  Session,
  User,
} from '@/types';
import { createId, createSessionCode } from '@/utils/id';

export type AppStoreState = {
  role: Role | null;
  currentUserId: string | null;
  users: User[];
  sessions: Session[];
  attendances: Attendance[];
  setRole: (role: Role) => void;
  setCurrentUser: (id: string) => void;
  resetIdentity: () => void;
  createSession: (input: CreateSessionInput) => Session;
  openSession: (id: string) => boolean;
  closeSession: (id: string) => boolean;
  submitAttendance: (sessionId: string, userId: string, code: string) => AttendResult;
};

type StoreData = Pick<AppStoreState, 'users' | 'sessions' | 'attendances'>;

export const useAppStore = create<AppStoreState>()((set, get) => ({
  role: null,
  currentUserId: null,
  users: dummyUsers,
  sessions: dummySessions,
  attendances: dummyAttendances,

  setRole: (role) => {
    set({ role });
  },

  setCurrentUser: (id) => {
    set({ currentUserId: id });
  },

  resetIdentity: () => {
    set({ role: null, currentUserId: null });
  },

  createSession: (input) => {
    const session: Session = {
      ...input,
      id: createId('session'),
      status: 'scheduled',
      code: createSessionCode(),
    };
    set((state) => ({ sessions: [...state.sessions, session] }));
    return session;
  },

  openSession: (id) => {
    const session = get().sessions.find((item) => item.id === id);
    if (!session || session.status !== 'scheduled') {
      return false;
    }
    const openedAt = new Date().toISOString();
    set((state) => ({
      sessions: state.sessions.map((item): Session =>
        item.id === id ? { ...item, status: 'open', openedAt } : item,
      ),
    }));
    return true;
  },

  closeSession: (id) => {
    const session = get().sessions.find((item) => item.id === id);
    if (!session || session.status !== 'open') {
      return false;
    }
    const closedAt = new Date().toISOString();
    set((state) => ({
      sessions: state.sessions.map((item): Session =>
        item.id === id ? { ...item, status: 'closed', closedAt } : item,
      ),
    }));
    return true;
  },

  submitAttendance: (sessionId, userId, code) => {
    const state = get();
    const session = state.sessions.find((item) => item.id === sessionId);

    if (!session || session.status !== 'open') {
      return { ok: false, reason: 'SESSION_NOT_OPEN' };
    }

    const user = state.users.find((item) => item.id === userId);
    if (!user || user.kelas === undefined || user.kelas !== session.kelas) {
      return { ok: false, reason: 'NOT_IN_CLASS' };
    }

    const alreadyAttended = state.attendances.some(
      (attendance) => attendance.sessionId === sessionId && attendance.userId === userId,
    );
    if (alreadyAttended) {
      return { ok: false, reason: 'ALREADY_ATTENDED' };
    }

    if (session.code !== code) {
      return { ok: false, reason: 'INVALID_CODE' };
    }

    const attendance: Attendance = {
      id: createId('attendance'),
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
    };
    set((current) => ({ attendances: [...current.attendances, attendance] }));
    return { ok: true, attendance };
  },
}));

export function selectSessionsForUser(userId: string) {
  return (state: StoreData): Session[] => {
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      return [];
    }

    const visibleSessions =
      user.role === 'asisten'
        ? state.sessions
        : state.sessions.filter((session) => session.kelas === user.kelas);

    return [...visibleSessions].sort((a, b) => a.startAt.localeCompare(b.startAt));
  };
}

export function selectSessionById(id: string) {
  return (state: StoreData): Session | null =>
    state.sessions.find((session) => session.id === id) ?? null;
}

export function selectAttendanceBySession(sessionId: string) {
  return (state: StoreData): Attendance[] =>
    state.attendances.filter((attendance) => attendance.sessionId === sessionId);
}

export function selectAttendanceByUser(userId: string) {
  return (state: StoreData): Attendance[] =>
    state.attendances.filter((attendance) => attendance.userId === userId);
}

export function hasAttended(sessionId: string, userId: string) {
  return (state: StoreData): boolean =>
    state.attendances.some(
      (attendance) => attendance.sessionId === sessionId && attendance.userId === userId,
    );
}

export function computeRekap(
  session: Session,
  users: User[],
  attendances: Attendance[],
): Rekap {
  const praktikan = users.filter(
    (user) => user.role === 'praktikan' && user.kelas === session.kelas,
  );

  const attendanceByUser = new Map<string, Attendance>();
  for (const attendance of attendances) {
    if (attendance.sessionId === session.id && !attendanceByUser.has(attendance.userId)) {
      attendanceByUser.set(attendance.userId, attendance);
    }
  }

  const hadir = praktikan
    .flatMap((user) => {
      const attendance = attendanceByUser.get(user.id);
      return attendance ? [{ user, timestamp: attendance.timestamp }] : [];
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const hadirIds = new Set(hadir.map((item) => item.user.id));
  const belumHadir = praktikan
    .filter((user) => !hadirIds.has(user.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'id'));

  return { total: praktikan.length, hadir, belumHadir };
}

export function useSessionsForUser(userId: string): Session[] {
  return useAppStore(useShallow(selectSessionsForUser(userId)));
}

export function useSessionById(id: string): Session | null {
  return useAppStore(useShallow(selectSessionById(id)));
}

export function useAttendanceBySession(sessionId: string): Attendance[] {
  return useAppStore(useShallow(selectAttendanceBySession(sessionId)));
}

export function useAttendanceByUser(userId: string): Attendance[] {
  return useAppStore(useShallow(selectAttendanceByUser(userId)));
}

export function useHasAttended(sessionId: string, userId: string): boolean {
  return useAppStore(hasAttended(sessionId, userId));
}

export function useRekap(sessionId: string): Rekap | null {
  const session = useSessionById(sessionId);
  const users = useAppStore((state) => state.users);
  const attendances = useAppStore((state) => state.attendances);

  return useMemo(
    () => (session ? computeRekap(session, users, attendances) : null),
    [session, users, attendances],
  );
}
