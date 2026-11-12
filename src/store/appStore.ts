import { useMemo } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { dummyKelasPraktikum, dummyUsers } from '@/data/dummy';
import { login as authLogin, logout as authLogout, register as authRegister } from '@/services/auth';
import {
  addKelas as svcAddKelas,
  deleteKelas as svcDeleteKelas,
  updateKelas as svcUpdateKelas,
} from '@/services/kelas';
import {
  createSession as svcCreateSession,
  deleteSession as svcDeleteSession,
  getSessionCode as svcGetSessionCode,
  setStatus as svcSetStatus,
  updateSession as svcUpdateSession,
} from '@/services/sessions';
import { submitAttendance as svcSubmitAttendance } from '@/services/attendance';
import {
  reviewIzin as svcReviewIzin,
  saveAiResult as svcSaveAiResult,
  submitIzin as svcSubmitIzin,
} from '@/services/izin';
import { classifyIzin } from '@/services/ai';
import { startSync, stopSync } from './sync';
import type {
  Attendance,
  AttendResult,
  CreateSessionInput,
  Izin,
  IzinStatus,
  KelasPraktikum,
  RegisterInput,
  Rekap,
  Result,
  Role,
  Session,
  User,
} from '@/types';

export type SyncKey = 'sessions' | 'kelas' | 'attendances' | 'izin' | 'users';
export type SyncStatus = 'idle' | 'loading' | 'ready' | 'error';

export type AppStoreState = {
  authStatus: 'loading' | 'signedOut' | 'signedIn';
  currentUser: User | null;
  /** @deprecated Gunakan currentUser.role */
  role: Role | null;
  /** @deprecated Gunakan currentUser.id */
  currentUserId: string | null;
  isOnline: boolean;
  sync: Record<SyncKey, SyncStatus>;

  users: User[];
  kelasList: KelasPraktikum[];
  sessions: Session[];
  attendances: Attendance[];
  izinList: Izin[];

  // Internal setters
  setCurrentUser: (user: User | null) => void;
  setAuthStatus: (status: 'loading' | 'signedOut' | 'signedIn') => void;
  setSyncStatus: (key: SyncKey, status: SyncStatus) => void;
  /** @deprecated Gunakan logout() */
  resetIdentity: () => void;

  // Aksi Auth (FR-01, FR-13 s.d. FR-15)
  register: (input: RegisterInput) => Promise<Result<User>>;
  login: (email: string, password: string) => Promise<Result<User>>;
  logout: () => Promise<void>;

  // Aksi Sesi & Kelas (FR-04 s.d. FR-06, FR-18 s.d. FR-20)
  createSession: (input: CreateSessionInput) => Promise<Result<Session>> & { id: string };
  updateSession: (id: string, patch: Partial<Session>) => Promise<Result>;
  deleteSession: (id: string) => Promise<Result>;
  openSession: (id: string) => Promise<Result> | boolean;
  closeSession: (id: string) => Promise<Result> | boolean;
  addKelas: (praktikum: string, kelas: string) => Promise<Result<KelasPraktikum>>;
  updateKelas: (id: string, praktikum: string, kelas: string) => Promise<Result>;
  deleteKelas: (id: string) => Promise<Result>;

  // Aksi Presensi & Izin (FR-07, FR-21 s.d. FR-24, FR-26)
  submitAttendance: (sessionId: string, code: string) => Promise<AttendResult>;
  submitIzin: (sessionId: string, alasan: string) => Promise<Result<Izin>>;
  retryAi: (izinId: string) => Promise<Result>;
  reviewIzin: (
    izinId: string,
    keputusan: 'approved' | 'rejected',
    catatan?: string,
  ) => Promise<Result>;
};

export const useAppStore = create<AppStoreState>()((set, get) => ({
  authStatus: 'loading',
  currentUser: null,
  role: null,
  currentUserId: null,
  isOnline: true,
  sync: {
    sessions: 'idle',
    kelas: 'idle',
    attendances: 'idle',
    izin: 'idle',
    users: 'idle',
  },

  users: dummyUsers,
  kelasList: dummyKelasPraktikum,
  sessions: [],
  attendances: [],
  izinList: [],

  setCurrentUser: (user) => {
    set({
      currentUser: user,
      role: user?.role ?? null,
      currentUserId: user?.id ?? null,
      authStatus: user ? 'signedIn' : 'signedOut',
    });
    if (user) {
      startSync(user);
    } else {
      stopSync();
      set({
        sessions: [],
        attendances: [],
        izinList: [],
      });
    }
  },

  setAuthStatus: (authStatus) => set({ authStatus }),

  resetIdentity: () => {
    get().logout();
  },

  setSyncStatus: (key, status) => {
    set((state) => ({
      sync: { ...state.sync, [key]: status },
    }));
  },

  register: async (input) => {
    const res = await authRegister(input);
    if (res.ok) {
      get().setCurrentUser(res.data);
    }
    return res;
  },

  login: async (email, password) => {
    const res = await authLogin(email, password);
    if (res.ok) {
      get().setCurrentUser(res.data);
    }
    return res;
  },

  logout: async () => {
    await authLogout();
    get().setCurrentUser(null);
  },

  createSession: (input) => {
    const tempId = `ses-${Date.now()}`;
    const promise = (async () => {
      const res = await svcCreateSession(input);
      return res;
    })() as Promise<Result<Session>> & { id: string };
    promise.id = tempId;
    return promise;
  },

  updateSession: async (id, patch) => {
    return svcUpdateSession(id, patch);
  },

  deleteSession: async (id) => {
    return svcDeleteSession(id);
  },

  openSession: (id) => {
    return (async () => {
      const res = await svcSetStatus(id, 'open');
      return res;
    })() as Promise<Result> | boolean;
  },

  closeSession: (id) => {
    return (async () => {
      const res = await svcSetStatus(id, 'closed');
      return res;
    })() as Promise<Result> | boolean;
  },

  addKelas: async (praktikum, kelas) => {
    const user = get().currentUser;
    return svcAddKelas(praktikum, kelas, user?.id ?? '');
  },

  updateKelas: async (id, praktikum, kelas) => {
    return svcUpdateKelas(id, praktikum, kelas);
  },

  deleteKelas: async (id) => {
    const kelasItem = get().kelasList.find((k) => k.id === id);
    if (kelasItem) {
      const isUsedInSessions = get().sessions.some(
        (s) => s.praktikum === kelasItem.praktikum && s.kelas === kelasItem.kelas,
      );
      if (isUsedInSessions) {
        return {
          ok: false,
          code: 'CONFLICT',
          message: 'Kelas tidak dapat dihapus karena masih digunakan oleh sesi praktikum',
        };
      }
    }
    return svcDeleteKelas(id);
  },

  submitAttendance: async (sessionId, code) => {
    const user = get().currentUser;
    if (!user) {
      return { ok: false, reason: 'UNKNOWN' };
    }

    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { ok: false, reason: 'SESSION_NOT_OPEN' };
    }

    // Cek apakah izin sudah disetujui (FR-28)
    const approvedIzin = get().izinList.some(
      (i) => i.sessionId === sessionId && i.userId === user.id && i.status === 'approved',
    );
    if (approvedIzin) {
      return { ok: false, reason: 'IZIN_APPROVED' };
    }

    // Pra-cek lokal sudah presensi
    const alreadyAttended = get().attendances.some(
      (a) => a.sessionId === sessionId && a.userId === user.id,
    );
    if (alreadyAttended) {
      return { ok: false, reason: 'ALREADY_ATTENDED' };
    }

    return svcSubmitAttendance(sessionId, user, code, session);
  },

  submitIzin: async (sessionId, alasan) => {
    const user = get().currentUser;
    if (!user) {
      return { ok: false, code: 'PERMISSION_DENIED', message: 'Harap masuk terlebih dahulu' };
    }

    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { ok: false, code: 'NOT_FOUND', message: 'Sesi tidak ditemukan' };
    }

    return svcSubmitIzin(sessionId, user, alasan, session);
  },

  retryAi: async (izinId) => {
    const izin = get().izinList.find((i) => i.id === izinId);
    if (!izin) {
      return { ok: false, code: 'NOT_FOUND', message: 'Pengajuan izin tidak ditemukan' };
    }

    const session = get().sessions.find((s) => s.id === izin.sessionId);
    const praktikum = session?.praktikum ?? 'Praktikum';
    const topik = session?.topik ?? '';
    const tanggalSesi = session?.startAt ?? new Date().toISOString();

    const aiResult = await classifyIzin({
      praktikum,
      topik,
      tanggalSesi,
      alasan: izin.alasan,
    });

    return svcSaveAiResult(izinId, aiResult);
  },

  reviewIzin: async (izinId, keputusan, catatan) => {
    const user = get().currentUser;
    return svcReviewIzin(izinId, user?.id ?? '', keputusan, catatan);
  },
}));

// ===== Fungsi Murni Rekapitulasi (FR-10, FR-28) =====

export function computeRekap(
  session: Session,
  users: User[],
  attendances: Attendance[],
  izinList: Izin[],
): Rekap {
  // Hanya praktikan di kelas sesi
  const praktikan = users.filter(
    (user) => user.role === 'praktikan' && user.kelas === session.kelas,
  );

  // 1. Hadir (urut waktu paling awal)
  const attendanceByUser = new Map<string, Attendance>();
  for (const att of attendances) {
    if (att.sessionId === session.id && !attendanceByUser.has(att.userId)) {
      attendanceByUser.set(att.userId, att);
    }
  }

  const hadir = praktikan
    .flatMap((user) => {
      const att = attendanceByUser.get(user.id);
      return att ? [{ user, timestamp: att.timestamp }] : [];
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const hadirIds = new Set(hadir.map((h) => h.user.id));

  // 2. Izin (hanya status 'approved', urut nama)
  const approvedIzinMap = new Map<string, Izin>();
  for (const iz of izinList) {
    if (iz.sessionId === session.id && iz.status === 'approved') {
      approvedIzinMap.set(iz.userId, iz);
    }
  }

  const izin = praktikan
    .flatMap((user) => {
      const iz = approvedIzinMap.get(user.id);
      return iz ? [{ user, izin: iz }] : [];
    })
    .sort((a, b) => a.user.name.localeCompare(b.user.name, 'id'));

  const izinApprovedIds = new Set(izin.map((i) => i.user.id));

  // 3. Belum Hadir (tidak hadir dan tidak berizin disetujui, urut nama)
  const belumHadir = praktikan
    .filter((user) => !hadirIds.has(user.id) && !izinApprovedIds.has(user.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'id'));

  return {
    total: praktikan.length,
    hadir,
    izin,
    belumHadir,
  };
}

// ===== Hook Baca Store =====

export function useCurrentUser(): User | null {
  return useAppStore((state) => state.currentUser);
}

export function useAuthStatus(): 'loading' | 'signedOut' | 'signedIn' {
  return useAppStore((state) => state.authStatus);
}

export function useIsOnline(): boolean {
  return useAppStore((state) => state.isOnline);
}

export function useSyncState(key: SyncKey): SyncStatus {
  return useAppStore((state) => state.sync[key]);
}

export function useKelasList(): KelasPraktikum[] {
  return useAppStore((state) => state.kelasList);
}

export function useSessionsForUser(userId: string): Session[] {
  return useAppStore(
    useShallow((state) => {
      const user = state.currentUser?.id === userId ? state.currentUser : state.users.find((u) => u.id === userId);
      if (!user) return [];

      const visible =
        user.role === 'asisten'
          ? state.sessions
          : state.sessions.filter((s) => s.kelas === user.kelas);

      return [...visible].sort((a, b) => a.startAt.localeCompare(b.startAt));
    }),
  );
}

export function useSessionById(id: string): Session | null {
  return useAppStore((state) => state.sessions.find((s) => s.id === id) ?? null);
}

export function useAttendanceBySession(sessionId: string): Attendance[] {
  return useAppStore(
    useShallow((state) => state.attendances.filter((a) => a.sessionId === sessionId)),
  );
}

export function useAttendanceByUser(userId: string): Attendance[] {
  return useAppStore(
    useShallow((state) => state.attendances.filter((a) => a.userId === userId)),
  );
}

export function useHasAttended(sessionId: string, userId: string): boolean {
  return useAppStore((state) =>
    state.attendances.some((a) => a.sessionId === sessionId && a.userId === userId),
  );
}

export function useRekap(sessionId: string): Rekap | null {
  const session = useSessionById(sessionId);
  const users = useAppStore((state) => state.users);
  const attendances = useAppStore((state) => state.attendances);
  const izinList = useAppStore((state) => state.izinList);

  return useMemo(
    () => (session ? computeRekap(session, users, attendances, izinList) : null),
    [session, users, attendances, izinList],
  );
}

export function useIzinByUser(userId: string): Izin[] {
  return useAppStore(
    useShallow((state) =>
      state.izinList
        .filter((i) => i.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),
  );
}

export function useIzinById(id: string): Izin | null {
  return useAppStore((state) => state.izinList.find((i) => i.id === id) ?? null);
}

export function useIzinBySession(sessionId: string): Izin[] {
  return useAppStore(
    useShallow((state) =>
      state.izinList
        .filter((i) => i.sessionId === sessionId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),
  );
}

export function useIzinForAsisten(filter?: IzinStatus | 'all'): Izin[] {
  return useAppStore(
    useShallow((state) => {
      const list = filter && filter !== 'all'
        ? state.izinList.filter((i) => i.status === filter)
        : state.izinList;
      return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }),
  );
}

export async function fetchSessionCode(sessionId: string): Promise<string | null> {
  return svcGetSessionCode(sessionId);
}
