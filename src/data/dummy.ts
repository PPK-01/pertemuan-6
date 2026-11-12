import type { Attendance, KelasPraktikum, Session, User } from '@/types';

export const dummyUsers: User[] = [
  { id: 'usr-asisten-1', name: 'Dina Pratiwi', email: 'dina@rawuh.ac.id', role: 'asisten' },
  { id: 'usr-asisten-2', name: 'Raka Pratama', email: 'raka@rawuh.ac.id', role: 'asisten' },
  { id: 'usr-praktikan-1', name: 'Bagas Saputra', email: 'bagas@rawuh.ac.id', role: 'praktikan', kelas: 'A' },
  { id: 'usr-praktikan-2', name: 'Citra Lestari', email: 'citra@rawuh.ac.id', role: 'praktikan', kelas: 'A' },
  { id: 'usr-praktikan-3', name: 'Dani Firmansyah', email: 'dani@rawuh.ac.id', role: 'praktikan', kelas: 'B' },
  { id: 'usr-praktikan-4', name: 'Eka Rahmawati', email: 'eka@rawuh.ac.id', role: 'praktikan', kelas: 'B' },
  { id: 'usr-praktikan-5', name: 'Fajar Nugraha', email: 'fajar@rawuh.ac.id', role: 'praktikan', kelas: 'A' },
  { id: 'usr-praktikan-6', name: 'Gita Permata', email: 'gita@rawuh.ac.id', role: 'praktikan', kelas: 'B' },
];

export const dummyKelasPraktikum: KelasPraktikum[] = [
  { id: 'kp-1', praktikum: 'Basis Data', kelas: 'A', createdBy: 'usr-asisten-1' },
  { id: 'kp-2', praktikum: 'Basis Data', kelas: 'B', createdBy: 'usr-asisten-1' },
  { id: 'kp-3', praktikum: 'Pemrograman Mobile', kelas: 'A', createdBy: 'usr-asisten-2' },
  { id: 'kp-4', praktikum: 'Pemrograman Mobile', kelas: 'B', createdBy: 'usr-asisten-2' },
];

export const dummySessions: Session[] = [
  {
    id: 'ses-1',
    praktikum: 'Basis Data',
    kelas: 'A',
    topik: 'Normalisasi dan ERD',
    ruang: 'Lab Komputer 1',
    startAt: '2026-11-12T08:00:00.000Z',
    endAt: '2026-11-12T10:00:00.000Z',
    status: 'open',
    createdBy: 'usr-asisten-1',
    openedAt: '2026-11-12T07:55:00.000Z',
  },
  {
    id: 'ses-2',
    praktikum: 'Pemrograman Mobile',
    kelas: 'A',
    topik: 'React Native Navigation & State',
    ruang: 'Lab Komputer 3',
    startAt: '2026-11-13T13:00:00.000Z',
    endAt: '2026-11-13T15:00:00.000Z',
    status: 'scheduled',
    createdBy: 'usr-asisten-2',
  },
  {
    id: 'ses-3',
    praktikum: 'Basis Data',
    kelas: 'B',
    topik: 'Query SQL Lanjutan & Subquery',
    ruang: 'Lab Komputer 1',
    startAt: '2026-11-11T08:00:00.000Z',
    endAt: '2026-11-11T10:00:00.000Z',
    status: 'closed',
    createdBy: 'usr-asisten-1',
    openedAt: '2026-11-11T08:00:00.000Z',
    closedAt: '2026-11-11T10:00:00.000Z',
  },
];

export const dummySessionCodes: Record<string, string> = {
  'ses-1': '0427',
  'ses-2': '8821',
  'ses-3': '1234',
};

export const dummyAttendances: Attendance[] = [
  {
    id: 'ses-1_usr-praktikan-1',
    sessionId: 'ses-1',
    userId: 'usr-praktikan-1',
    kelas: 'A',
    timestamp: '2026-11-12T08:05:00.000Z',
  },
];
