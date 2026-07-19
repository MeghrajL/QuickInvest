import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { TimeRange } from "@/types/fund";

interface TimeRangeFilterProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const RANGES: TimeRange[] = ["1M", "3M", "6M", "1Y", "ALL"];

const LABELS: Record<TimeRange, string> = {
  "1M": "1M",
  "3M": "3M",
  "6M": "6M",
  "1Y": "1Y",
  ALL: "All",
};

function TimeRangeFilterInner({
  selectedRange,
  onRangeChange,
}: TimeRangeFilterProps) {
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
              {
                backgroundColor: isActive ? theme.accent : "transparent",
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filter by ${LABELS[range]}`}
          >
            <ThemedText
              style={[
                styles.pillText,
                { color: isActive ? "#0d0d12" : theme.textSecondary },
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
    flexDirection: "row",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export const TimeRangeFilter = React.memo(TimeRangeFilterInner);
