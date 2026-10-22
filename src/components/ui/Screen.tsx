import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { colors } from '@/theme/colors';
import { layout, spacing } from '@/theme/spacing';

export type ScreenProps = {
  children: ReactNode;
  /** Default true; false bila isi layar memakai FlatList (hindari nested VirtualizedList). */
  scroll?: boolean;
  /** Default ['left', 'right', 'bottom']; layar dalam tab memakai ['left', 'right']. */
  edges?: Edge[];
};

const DEFAULT_EDGES: Edge[] = ['left', 'right', 'bottom'];

export function Screen({ children, scroll = true, edges = DEFAULT_EDGES }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>
      ) : (
        <View style={styles.fill}>
          <View style={[styles.content, styles.fill]}>{children}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  fill: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
