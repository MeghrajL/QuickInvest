import React, { useCallback } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WatchlistItem as WatchlistItemType } from '@/types/fund';
import { formatINR } from '@/utils/format';
import { parseNAVDate, formatDisplayDate } from '@/utils/date';

interface WatchlistItemProps {
  item: WatchlistItemType;
  onPress: (item: WatchlistItemType) => void;
  onRemove: (schemeCode: number) => void;
}

export const WatchlistItem = React.memo(function WatchlistItem({
  item,
  onPress,
  onRemove,
}: WatchlistItemProps) {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const handleRemove = useCallback(() => {
    onRemove(item.schemeCode);
  }, [item.schemeCode, onRemove]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: theme.backgroundElement },
        pressed && { backgroundColor: theme.backgroundElement },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.schemeName}${item.isStale ? ', stale data' : ''}`}
    >
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <ThemedText style={styles.fundName} numberOfLines={2}>
            {item.schemeName}
          </ThemedText>
          {item.isStale && (
            <View style={styles.staleBadge}>
              <ThemedText style={styles.staleBadgeText}>Stale</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.detailsRow}>
          {item.latestNAV != null && (
            <ThemedText type="small" themeColor="textSecondary">
              NAV: {formatINR(item.latestNAV)}
            </ThemedText>
          )}
          {item.lastUpdated && (
            <ThemedText type="small" themeColor="textSecondary">
              Updated: {formatDisplayDate(parseNAVDate(item.lastUpdated))}
            </ThemedText>
          )}
        </View>
      </View>

      <Pressable
        onPress={handleRemove}
        style={styles.removeButton}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.schemeName} from watchlist`}
        hitSlop={8}
      >
        <ThemedText style={styles.removeText}>✕</ThemedText>
      </Pressable>
    </Pressable>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  fundName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    flexShrink: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  staleBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  staleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
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
