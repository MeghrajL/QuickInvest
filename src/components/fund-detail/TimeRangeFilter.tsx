import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { TimeRange } from '@/types/fund';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface TimeRangeFilterProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const RANGES: TimeRange[] = ['1M', '3M', '6M', '1Y', 'ALL'];

const LABELS: Record<TimeRange, string> = {
  '1M': '1M',
  '3M': '3M',
  '6M': '6M',
  '1Y': '1Y',
  'ALL': 'All',
};

function TimeRangeFilterInner({ selectedRange, onRangeChange }: TimeRangeFilterProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {RANGES.map((range) => {
        const isActive = range === selectedRange;

        return (
          <Pressable
            key={range}
            onPress={() => onRangeChange(range)}
            style={[
              styles.pill,
              { backgroundColor: isActive ? theme.backgroundSelected : theme.backgroundElement },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter by ${LABELS[range]}`}
          >
            <ThemedText
              style={[
                styles.pillText,
                isActive && styles.pillTextActive,
              ]}
            >
              {LABELS[range]}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 16,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextActive: {
    fontWeight: '700',
  },
});

export const TimeRangeFilter = React.memo(TimeRangeFilterInner);
