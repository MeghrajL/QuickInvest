import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { HoldingRecord } from '@/types/fund';
import { formatINR, formatNAV, formatUnits, formatPercentage, getReturnColor } from '@/utils/format';

interface HoldingItemProps {
  holding: HoldingRecord;
  onRemove: (id: string) => void;
}

export const HoldingItem = React.memo(function HoldingItem({
  holding,
  onRemove,
}: HoldingItemProps) {
  const theme = useTheme();

  const handleRemove = useCallback(() => {
    onRemove(holding.id);
  }, [holding.id, onRemove]);

  const hasReturn = holding.returnAmount != null && holding.returnPercentage != null;
  const isPositive = hasReturn && holding.returnAmount! >= 0;
  const returnColor = hasReturn ? getReturnColor(holding.returnAmount!) : undefined;

  return (
    <View
      style={[styles.container, { borderBottomColor: theme.backgroundElement }]}
      accessibilityRole="summary"
      accessibilityLabel={`Holding: ${holding.fundName}, ${formatUnits(holding.units)} units`}
    >
      <View style={styles.content}>
        <ThemedText style={styles.fundName} numberOfLines={2}>
          {holding.fundName}
        </ThemedText>

        <ThemedText type="small" themeColor="textSecondary">
          {formatUnits(holding.units)} units
        </ThemedText>

        <View style={styles.navRow}>
          {holding.purchaseNAV != null && (
            <ThemedText type="small" themeColor="textSecondary">
              Buy: ₹{formatNAV(holding.purchaseNAV)}
            </ThemedText>
          )}
          {holding.currentNAV != null && (
            <ThemedText type="small" themeColor="textSecondary">
              Current: ₹{formatNAV(holding.currentNAV)}
            </ThemedText>
          )}
        </View>

        {holding.currentValue != null && (
          <ThemedText style={styles.currentValue}>
            {formatINR(holding.currentValue)}
          </ThemedText>
        )}

        {hasReturn ? (
          <ThemedText style={[styles.returnText, { color: returnColor }]}>
            {isPositive ? '↑' : '↓'} ₹{formatINR(Math.abs(holding.returnAmount!)).slice(1)}{' '}
            ({formatPercentage(holding.returnPercentage!)})
          </ThemedText>
        ) : (
          <ThemedText type="small" themeColor="textSecondary" style={styles.unavailable}>
            Returns unavailable
          </ThemedText>
        )}
      </View>

      <Pressable
        onPress={handleRemove}
        style={styles.removeButton}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${holding.fundName} from holdings`}
        hitSlop={8}
      >
        <ThemedText style={styles.removeText}>✕</ThemedText>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  fundName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  returnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  unavailable: {
    fontStyle: 'italic',
  },
  removeButton: {
    marginLeft: Spacing.two,
    padding: Spacing.two,
  },
  removeText: {
    fontSize: 16,
    color: '#e53935',
    fontWeight: '600',
  },
});
