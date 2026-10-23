import { useRef, useState } from 'react';
import type { ComponentRef, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { KeyboardAvoidingViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';

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

// Android edge-to-edge tidak me-resize window saat keyboard muncul, jadi ruangnya dibuat di sini.
// Web tidak punya event keyboard; tanpa behavior, KeyboardAvoidingView hanya View biasa.
const KEYBOARD_BEHAVIOR: KeyboardAvoidingViewProps['behavior'] =
  Platform.OS === 'web' ? undefined : 'padding';

export function Screen({ children, scroll = true, edges = DEFAULT_EDGES }: ScreenProps) {
  const safeAreaRef = useRef<ComponentRef<typeof SafeAreaView>>(null);
  // Frame KeyboardAvoidingView relatif terhadap SafeAreaView, sedangkan posisi keyboard relatif
  // terhadap window; offset = posisi SafeAreaView di window (mis. di bawah header Stack).
  // Bila sistem ternyata ikut me-resize, overlap-nya 0 sehingga tidak ada padding ganda.
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const measureKeyboardOffset = () => {
    if (!KEYBOARD_BEHAVIOR) return;
    safeAreaRef.current?.measureInWindow((_x, y) => setKeyboardOffset(y));
  };

  return (
    <SafeAreaView
      ref={safeAreaRef}
      edges={edges}
      onLayout={measureKeyboardOffset}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        behavior={KEYBOARD_BEHAVIOR}
        keyboardVerticalOffset={keyboardOffset}
        style={styles.fill}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.content}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[styles.content, styles.fill]}>{children}</View>
        )}
      </KeyboardAvoidingView>
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
