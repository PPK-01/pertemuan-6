import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type TileProps = {
  label: string;
  count: number;
  iconType: 'all' | 'scheduled' | 'open' | 'closed';
  selected?: boolean;
  onPress: () => void;
};

function TileIcon({ type, selected }: { type: TileProps['iconType']; selected?: boolean }) {
  const tint = selected ? colors.accent : colors.primary;

  if (type === 'all') {
    return (
      <View style={styles.iconBox}>
        <View style={styles.grid2x2}>
          <View style={[styles.gridDot, { backgroundColor: tint }]} />
          <View style={[styles.gridDot, { backgroundColor: tint }]} />
          <View style={[styles.gridDot, { backgroundColor: tint }]} />
          <View style={[styles.gridDot, { backgroundColor: tint }]} />
        </View>
      </View>
    );
  }

  if (type === 'scheduled') {
    return (
      <View style={styles.iconBox}>
        <View style={[styles.hollowCircle, { borderColor: tint }]}>
          <View style={[styles.clockHand, { backgroundColor: tint }]} />
        </View>
      </View>
    );
  }

  if (type === 'open') {
    return (
      <View style={styles.iconBox}>
        <View style={[styles.filledCircle, { backgroundColor: tint }]} />
      </View>
    );
  }

  return (
    <View style={styles.iconBox}>
      <View style={[styles.closedBox, { backgroundColor: tint }]} />
    </View>
  );
}

export function Tile({ label, count, iconType, selected = false, onPress }: TileProps) {
  return (
    <Pressable
      onPress={onPress}
      role="radio"
      aria-checked={selected}
      aria-label={`${label}, ${count} sesi`}
      style={({ pressed }) => [
        styles.tile,
        selected ? styles.tileSelected : styles.tileUnselected,
        pressed && { opacity: PRESSED_OPACITY },
      ]}
    >
      <View style={styles.topRow}>
        <TileIcon type={iconType} selected={selected} />
        <Text
          style={[
            styles.countText,
            selected ? styles.textSelected : styles.textUnselected,
          ]}
        >
          {count}
        </Text>
      </View>
      <Text
        style={[
          styles.labelText,
          selected ? styles.textSelected : styles.textUnselected,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 70,
    minHeight: layout.minTouch + 24,
    borderRadius: radius.tile,
    padding: spacing.md,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  tileUnselected: {
    backgroundColor: colors.tile,
    borderColor: colors.border,
  },
  tileSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.label.fontWeight,
  },
  countText: {
    fontSize: typography.heading.fontSize,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  textUnselected: {
    color: colors.text,
  },
  textSelected: {
    color: colors.onPrimary,
  },
  grid2x2: {
    width: 14,
    height: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDot: {
    width: 5,
    height: 5,
    borderRadius: 1,
  },
  hollowCircle: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHand: {
    width: 1.5,
    height: 5,
    borderRadius: 1,
  },
  filledCircle: {
    width: 14,
    height: 14,
    borderRadius: radius.full,
  },
  closedBox: {
    width: 13,
    height: 13,
    borderRadius: 2,
  },
});
