import { router } from 'expo-router';

import { SessionRow } from '@/components/session/SessionRow';
import { useRekap } from '@/store/appStore';
import type { Session } from '@/types';

export type SessionListItemProps = {
  session: Session;
};

export function SessionListItem({ session }: SessionListItemProps) {
  const rekap = useRekap(session.id);
  const showAttendance =
    rekap !== null && (session.status === 'open' || session.status === 'closed');
  const footerText = showAttendance
    ? `${rekap.hadir.length} dari ${rekap.total} hadir`
    : undefined;

  return (
    <SessionRow
      session={session}
      onPress={() => router.push({ pathname: '/asisten/sesi/[id]', params: { id: session.id } })}
      footerText={footerText}
    />
  );
}
