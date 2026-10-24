import { StyleSheet, Text } from 'react-native';

import { SessionCard } from '@/components/session/SessionCard';
import { useRekap } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type { Session } from '@/types';

export type SessionListItemProps = {
  session: Session;
};

export function SessionListItem({ session }: SessionListItemProps) {
  const rekap = useRekap(session.id);
  // Sesi yang belum dibuka belum punya kehadiran untuk dihitung.
  const showAttendance =
    rekap !== null && (session.status === 'open' || session.status === 'closed');

  return (
    <SessionCard
      session={session}
      footer={
        showAttendance ? (
          <Text style={styles.attendance}>
            {`${rekap.hadir.length} dari ${rekap.total} hadir`}
          </Text>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  attendance: { ...typography.label, color: colors.textMuted },
});
