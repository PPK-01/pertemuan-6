import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import type { ButtonProps } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type SheetAction = Pick<ButtonProps, 'label' | 'onPress' | 'variant' | 'loading' | 'disabled'>;

export type BottomSheetProps = {
  visible: boolean;
  /** Dipanggil saat overlay ditekan dan saat tombol back Android. */
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** Variant default 'primary'. */
  primaryAction?: SheetAction;
  /** Biasanya { label: 'Batal', onPress: onClose }. Variant default 'secondary'. */
  secondaryAction?: SheetAction;
};

const OPEN_DURATION_MS = 250;
const CLOSE_DURATION_MS = 200;
const OPEN_EASING = Easing.out(Easing.cubic); // decelerate
const CLOSE_EASING = Easing.in(Easing.cubic); // accelerate
// Web tidak mendukung native driver dan memunculkan warning bila diminta.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function useReduceMotion(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setEnabled(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setEnabled);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return enabled;
}

/**
 * Satu nilai `progress` (0 = tertutup, 1 = terbuka) menggerakkan overlay dan panel sekaligus.
 * `mounted` bertahan sampai animasi tutup selesai; membuka lagi di tengah animasi tutup
 * menghentikannya (finished = false) sehingga sheet tidak ikut di-unmount.
 */
function useSheetTransition(visible: boolean) {
  const [progress] = useState(() => new Animated.Value(0));
  const [mounted, setMounted] = useState(visible);
  const reduceMotion = useReduceMotion();

  // Disetel saat render, bukan di effect, agar Modal sudah ter-mount sebelum animasi buka dimulai.
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: reduceMotion ? 0 : visible ? OPEN_DURATION_MS : CLOSE_DURATION_MS,
      easing: visible ? OPEN_EASING : CLOSE_EASING,
      useNativeDriver: USE_NATIVE_DRIVER,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
    return () => animation.stop();
  }, [visible, reduceMotion, progress]);

  return { mounted, progress };
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { mounted, progress } = useSheetTransition(visible);
  // Tinggi panel hanya geometri slide, bukan driver kedua. Nilai awal tinggi layar
  // agar panel sudah di luar layar sebelum onLayout pertama.
  const [panelHeight] = useState(() => new Animated.Value(windowHeight));
  const translateY = Animated.multiply(Animated.subtract(1, progress), panelHeight);

  // useLayoutEffect berjalan sinkron saat commit, sebelum event berikutnya diproses, sehingga
  // tap yang sudah antre setelah visible menjadi false langsung ditolak.
  const visibleRef = useRef(visible);
  useLayoutEffect(() => {
    visibleRef.current = visible;
  }, [visible]);
  const whileVisible = (handler: () => void) => () => {
    if (visibleRef.current) handler();
  };
  const handleClose = whileVisible(onClose);
  // Selama animasi tutup, sheet tidak menerima sentuhan sama sekali.
  const touchable = { pointerEvents: visible ? 'auto' : 'none' } as const;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={handleClose}>
      <View style={[styles.root, touchable]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: progress }]}>
          <Pressable onPress={handleClose} role="button" aria-label="Tutup" style={styles.fill} />
        </Animated.View>
        <Animated.View
          onLayout={(event) => panelHeight.setValue(event.nativeEvent.layout.height)}
          style={[
            styles.panel,
            { paddingBottom: spacing.lg + insets.bottom, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          {children}
          {secondaryAction || primaryAction ? (
            <View style={styles.actions}>
              {secondaryAction ? (
                <Button
                  {...secondaryAction}
                  onPress={whileVisible(secondaryAction.onPress)}
                  variant={secondaryAction.variant ?? 'secondary'}
                  style={styles.action}
                />
              ) : null}
              {primaryAction ? (
                <Button
                  {...primaryAction}
                  onPress={whileVisible(primaryAction.onPress)}
                  style={styles.action}
                />
              ) : null}
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  overlay: { backgroundColor: colors.overlay },
  fill: { flex: 1 },
  panel: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { ...typography.heading, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
