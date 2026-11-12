import { listenKelas } from '@/services/kelas';
import { listenSessions } from '@/services/sessions';
import { listenAttendances } from '@/services/attendance';
import { listenIzin } from '@/services/izin';
import { listenPraktikan } from '@/services/users';
import { connectionService } from '@/services/connection';
import { useAppStore } from './appStore';
import type { User } from '@/types';

type UnsubscribeFn = () => void;
const activeUnsubscribers: UnsubscribeFn[] = [];

export function startSync(user: User): void {
  stopSync();

  const store = useAppStore.getState();

  // 1. Monitor Koneksi Jaringan
  const connUnsub = connectionService.subscribe((isConnected) => {
    useAppStore.setState({ isOnline: isConnected });
  });
  activeUnsubscribers.push(connUnsub);

  // 2. Listener Kelas Praktikum (Publik / Keduanya)
  store.setSyncStatus('kelas', 'loading');
  const kelasUnsub = listenKelas(
    (kelasList) => {
      useAppStore.setState({ kelasList });
      useAppStore.getState().setSyncStatus('kelas', 'ready');
    },
    () => {
      useAppStore.getState().setSyncStatus('kelas', 'error');
    },
  );
  activeUnsubscribers.push(kelasUnsub);

  // 3. Listener Sessions (Sesuai peran)
  store.setSyncStatus('sessions', 'loading');
  const sessionsUnsub = listenSessions(
    user,
    (sessions) => {
      useAppStore.setState({ sessions });
      useAppStore.getState().setSyncStatus('sessions', 'ready');
    },
    () => {
      useAppStore.getState().setSyncStatus('sessions', 'error');
    },
  );
  activeUnsubscribers.push(sessionsUnsub);

  // 4. Listener Attendances (Sesuai peran)
  store.setSyncStatus('attendances', 'loading');
  const attendancesUnsub = listenAttendances(
    user,
    (attendances) => {
      useAppStore.setState({ attendances });
      useAppStore.getState().setSyncStatus('attendances', 'ready');
    },
    () => {
      useAppStore.getState().setSyncStatus('attendances', 'error');
    },
  );
  activeUnsubscribers.push(attendancesUnsub);

  // 5. Listener Izin (Sesuai peran)
  store.setSyncStatus('izin', 'loading');
  const izinUnsub = listenIzin(
    user,
    (izinList) => {
      useAppStore.setState({ izinList });
      useAppStore.getState().setSyncStatus('izin', 'ready');

      // FR-23: Jika izin masih pending_ai saat aplikasi dibuka kembali, jalankan ulang AI otomatis
      if (user.role === 'praktikan') {
        const pendingAiIzin = izinList.filter(
          (i) => i.userId === user.id && i.status === 'pending_ai',
        );
        pendingAiIzin.forEach((item) => {
          useAppStore.getState().retryAi(item.id);
        });
      }
    },
    () => {
      useAppStore.getState().setSyncStatus('izin', 'error');
    },
  );
  activeUnsubscribers.push(izinUnsub);

  // 6. Listener Users (Hanya Asisten)
  if (user.role === 'asisten') {
    store.setSyncStatus('users', 'loading');
    const usersUnsub = listenPraktikan(
      (users) => {
        useAppStore.setState({ users });
        useAppStore.getState().setSyncStatus('users', 'ready');
      },
      () => {
        useAppStore.getState().setSyncStatus('users', 'error');
      },
    );
    activeUnsubscribers.push(usersUnsub);
  } else {
    useAppStore.getState().setSyncStatus('users', 'ready');
  }
}

export function stopSync(): void {
  while (activeUnsubscribers.length > 0) {
    const unsub = activeUnsubscribers.pop();
    try {
      unsub?.();
    } catch {
      // Abaikan error saat cleanup
    }
  }

  useAppStore.setState({
    sync: {
      sessions: 'idle',
      kelas: 'idle',
      attendances: 'idle',
      izin: 'idle',
      users: 'idle',
    },
  });
}
