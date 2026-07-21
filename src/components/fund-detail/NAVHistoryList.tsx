import React, { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { NAVEntry } from "@/types/fund";
import { formatDisplayDate, parseNAVDate } from "@/utils/date";
import { formatNAV } from "@/utils/format";

interface NAVHistoryListProps {
  data: NAVEntry[];
  hasMore?: boolean;
  onViewAll?: () => void;
}

const ROW_HEIGHT = 48;

interface NAVRowProps {
  entry: NAVEntry;
  borderColor: string;
  isLast: boolean;
}

const NAVRow = React.memo(function NAVRow({
  entry,
  borderColor,
  isLast,
}: NAVRowProps) {
  const date = parseNAVDate(entry.date);
  const formattedDate = formatDisplayDate(date);
  const navValue = parseFloat(entry.nav);
  const formattedNAV = `₹${formatNAV(navValue)}`;

  return (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomColor: borderColor,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <ThemedText style={styles.dateText} themeColor="textSecondary">
        {formattedDate}
      </ThemedText>
      <ThemedText style={styles.navText}>{formattedNAV}</ThemedText>
    </View>
  );
});

function NAVHistoryListInner({
  data,
  hasMore,
  onViewAll,
}: NAVHistoryListProps) {
  const theme = useTheme();
  const borderColor = theme.border;

  const renderItem = useCallback(
    ({ item, index }: { item: NAVEntry; index: number }) => (
      <NAVRow
        entry={item}
        borderColor={borderColor}
        isLast={!hasMore && index === data.length - 1}
      />
    ),
    [borderColor, data.length, hasMore],
  );

  const keyExtractor = useCallback(
    (item: NAVEntry, index: number) => `${item.date}-${index}`,
    [],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<NAVEntry> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.sectionHeader}>NAV History</ThemedText>
        {hasMore && onViewAll && (
          <Pressable onPress={onViewAll} hitSlop={8}>
            <ThemedText style={styles.viewAllLink} themeColor="accent">
              View All →
            </ThemedText>
          </Pressable>
        )}
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: ROW_HEIGHT,
    paddingVertical: Spacing.three,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
  },
  navText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export const NAVHistoryList = React.memo(NAVHistoryListInner);
