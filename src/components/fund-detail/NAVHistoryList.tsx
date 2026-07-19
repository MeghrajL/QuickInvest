import React, { useCallback } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';

import { NAVEntry } from '@/types/fund';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { formatNAV } from '@/utils/format';
import { parseNAVDate, formatDisplayDate } from '@/utils/date';

interface NAVHistoryListProps {
  data: NAVEntry[];
}

const ROW_HEIGHT = 44;

interface NAVRowProps {
  entry: NAVEntry;
  borderColor: string;
}

const NAVRow = React.memo(function NAVRow({ entry, borderColor }: NAVRowProps) {
  const date = parseNAVDate(entry.date);
  const formattedDate = formatDisplayDate(date);
  const navValue = parseFloat(entry.nav);
  const formattedNAV = `₹${formatNAV(navValue)}`;

  return (
    <View style={[styles.row, { borderBottomColor: borderColor }]}>
      <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
      <ThemedText style={styles.navText}>{formattedNAV}</ThemedText>
    </View>
  );
});

function NAVHistoryListInner({ data }: NAVHistoryListProps) {
  const theme = useTheme();
  const borderColor = theme.backgroundElement;

  const renderItem = useCallback(
    ({ item }: { item: NAVEntry }) => (
      <NAVRow entry={item} borderColor={borderColor} />
    ),
    [borderColor]
  );

  const keyExtractor = useCallback((item: NAVEntry) => item.date, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<NAVEntry> | null | undefined, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <ThemedText style={styles.sectionHeader}>NAV History</ThemedText>
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
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: ROW_HEIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateText: {
    fontSize: 14,
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export const NAVHistoryList = React.memo(NAVHistoryListInner);
