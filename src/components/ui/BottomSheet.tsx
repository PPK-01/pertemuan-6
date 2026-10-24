import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentRef, ReactNode, Ref } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

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
// Tombol aksi bertumpuk bila width / fontScale di bawah nilai ini. Pada 360, tiap tombol yang
// berdampingan masih memuat ±16 karakter typography.label dalam satu baris di skala font berapa pun.
const STACK_ACTIONS_BELOW = 360;

type TextRef = ComponentRef<typeof Text>;

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
  const outerInsets = useSafeAreaInsets();
  const outerFrame = useSafeAreaFrame();
  const { height: windowHeight } = useWindowDimensions();
  const { mounted, progress } = useSheetTransition(visible);
  // Tinggi panel hanya geometri slide, bukan driver kedua. Nilai awal tinggi layar
  // agar panel sudah di luar layar sebelum onLayout pertama.
  const [panelHeight] = useState(() => new Animated.Value(windowHeight));
  const titleRef = useRef<TextRef>(null);

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

  // Android: Modal adalah window terpisah; arahkan TalkBack ke judul agar dibaca lebih dulu.
  // Web: focus trap Modal sudah memindahkan fokus ke tombol pertama di panel.
  const focusTitle = () => {
    if (Platform.OS !== 'web' && titleRef.current) {
      AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');
    }
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      onShow={focusTitle}
    >
      {/* Inset dibaca dari window Modal sendiri; nilai luar hanya tebakan awal agar tidak ada frame kosong. */}
      <SafeAreaProvider initialMetrics={{ insets: outerInsets, frame: outerFrame }}>
        <SheetLayout
          interactive={visible}
          title={title}
          titleRef={titleRef}
          progress={progress}
          panelHeight={panelHeight}
          onPanelLayout={(event) => panelHeight.setValue(event.nativeEvent.layout.height)}
          onClose={handleClose}
          primaryAction={
            primaryAction && { ...primaryAction, onPress: whileVisible(primaryAction.onPress) }
          }
          secondaryAction={
            secondaryAction && { ...secondaryAction, onPress: whileVisible(secondaryAction.onPress) }
          }
        >
          {children}
        </SheetLayout>
      </SafeAreaProvider>
    </Modal>
  );
}

type SheetLayoutProps = Pick<
  BottomSheetProps,
  'onClose' | 'title' | 'children' | 'primaryAction' | 'secondaryAction'
> & {
  /** false selama animasi tutup: sheet tidak menerima sentuhan sama sekali. */
  interactive: boolean;
  titleRef: Ref<TextRef>;
  progress: Animated.Value;
  panelHeight: Animated.Value;
  onPanelLayout: (event: LayoutChangeEvent) => void;
};

function SheetLayout({
  interactive,
  onClose,
  title,
  titleRef,
  children,
  primaryAction,
  secondaryAction,
  progress,
  panelHeight,
  onPanelLayout,
}: SheetLayoutProps) {
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const stacked = width / fontScale < STACK_ACTIONS_BELOW;
  const translateY = Animated.multiply(Animated.subtract(1, progress), panelHeight);
  const actionStyle = stacked ? undefined : styles.rowAction;

  const secondary = secondaryAction ? (
    <Button
      {...secondaryAction}
      variant={secondaryAction.variant ?? 'secondary'}
      style={actionStyle}
    />
  ) : null;
  const primary = primaryAction ? <Button {...primaryAction} style={actionStyle} /> : null;

  return (
    <View
      style={[
        styles.root,
        {
          // Pita overlay di atas panel tetap bisa diketuk walau isi sheet panjang.
          paddingTop: insets.top + spacing.xxl,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          pointerEvents: interactive ? 'auto' : 'none',
        },
      ]}
    >
      {/* Panel sebelum overlay agar screen reader dan Tab membaca judul dan aksi lebih dulu;
          zIndex menjaga panel tetap di atas overlay. */}
      <Animated.View
        aria-modal
        onLayout={onPanelLayout}
        style={[
          styles.panel,
          { paddingBottom: spacing.lg + insets.bottom, transform: [{ translateY }] },
        ]}
      >
        <Text ref={titleRef} role="heading" style={styles.title}>
          {title}
        </Text>
        {children != null ? (
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {children}
          </ScrollView>
        ) : null}
        {primary || secondary ? (
          // Berdampingan: secondary kiri, primary kanan. Bertumpuk: primary di atas.
          <View style={stacked ? styles.actionsStacked : styles.actionsRow}>
            {stacked ? primary : secondary}
            {stacked ? secondary : primary}
          </View>
        ) : null}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: progress }]}>
        <Pressable onPress={onClose} role="button" aria-label="Tutup" style={styles.fill} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  overlay: { backgroundColor: colors.overlay },
  fill: { flex: 1 },
  panel: {
    zIndex: 1,
    flexShrink: 1,
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
  // Hanya isi yang di-scroll; judul dan aksi tetap terlihat saat panel mencapai batas tinggi.
  body: { flexGrow: 0, flexShrink: 1 },
  bodyContent: { gap: spacing.md },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionsStacked: { gap: spacing.sm },
  rowAction: { flex: 1 },
});
