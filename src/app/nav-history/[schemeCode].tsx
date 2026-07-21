import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useFundDetail } from "@/hooks/use-fund-detail";
import { useTheme } from "@/hooks/use-theme";
import { NAVEntry } from "@/types/fund";
import { formatDisplayDate, parseNAVDate } from "@/utils/date";
import { formatNAV } from "@/utils/format";

const PAGE_SIZE = 100;
const ROW_HEIGHT = 48;

export default function NAVHistoryScreen() {
  const { schemeCode: schemeCodeParam } = useLocalSearchParams<{
    schemeCode: string;
  }>();
  const schemeCode = Number(schemeCodeParam);
  const theme = useTheme();
  const router = useRouter();

  const { fund, isLoading } = useFundDetail(schemeCode);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allData = useMemo(() => {
    if (!fund) return [];
    return fund.data;
  }, [fund]);

  const displayData = useMemo(() => {
    return allData.slice(0, visibleCount);
  }, [allData, visibleCount]);

  const hasMore = allData.length > visibleCount;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + PAGE_SIZE);
    }
  }, [hasMore]);

  const renderItem = useCallback(
    ({ item, index }: { item: NAVEntry; index: number }) => {
      const date = parseNAVDate(item.date);
      const formattedDate = formatDisplayDate(date);
      const navValue = parseFloat(item.nav);
      const formattedNAV = `₹${formatNAV(navValue)}`;

      return (
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <ThemedText style={styles.dateText} themeColor="textSecondary">
            {formattedDate}
          </ThemedText>
          <ThemedText style={styles.navText}>{formattedNAV}</ThemedText>
        </View>
      );
    },
    [theme.border],
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

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.dark.accent} />
        <ThemedText style={styles.footerText} themeColor="textSecondary">
          Loading more...
        </ThemedText>
      </View>
    );
  }, [hasMore]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <LoadingIndicator message="Loading NAV history..." />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.backgroundElement },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>NAV History</ThemedText>
          <ThemedText style={styles.headerCount} themeColor="textSecondary">
            {allData.length} total
          </ThemedText>
        </View>

        {/* Fund name */}
        {fund && (
          <ThemedText
            style={styles.fundName}
            numberOfLines={1}
            themeColor="textSecondary"
          >
            {fund.meta.scheme_name}
          </ThemedText>
        )}

        {/* Virtualized list */}
        <FlatList
          data={displayData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
  },
  headerCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  fundName: {
    fontSize: 13,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: ROW_HEIGHT,
    paddingHorizontal: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
  },
  navText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  listContent: {
    paddingBottom: Spacing.six,
  },
  footer: {
    paddingVertical: Spacing.five,
    alignItems: "center",
    gap: Spacing.two,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
