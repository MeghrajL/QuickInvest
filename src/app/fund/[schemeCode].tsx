import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { HoldingForm } from "@/components/fund-detail/HoldingForm";
import { NAVChart } from "@/components/fund-detail/NAVChart";
import { NAVHistoryList } from "@/components/fund-detail/NAVHistoryList";
import { TimeRangeFilter } from "@/components/fund-detail/TimeRangeFilter";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useFundDetail } from "@/hooks/use-fund-detail";
import { useTheme } from "@/hooks/use-theme";
import { useHoldingsStore } from "@/stores/holdings-store";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { TimeRange } from "@/types/fund";
import { filterByTimeRange } from "@/utils/chart";
import { formatDisplayDate, parseNAVDate } from "@/utils/date";
import { formatNAV } from "@/utils/format";

export default function FundDetailScreen() {
  const { schemeCode: schemeCodeParam } = useLocalSearchParams<{
    schemeCode: string;
  }>();
  const schemeCode = Number(schemeCodeParam);
  const theme = useTheme();

  const { fund, isLoading, error, retry } = useFundDetail(schemeCode);

  const [selectedRange, setSelectedRange] = useState<TimeRange>("1Y");
  const [holdingFormVisible, setHoldingFormVisible] = useState(false);

  const isInWatchlist = useWatchlistStore((s) => s.isInWatchlist(schemeCode));
  const addToWatchlist = useWatchlistStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useWatchlistStore((s) => s.removeFromWatchlist);
  const addHolding = useHoldingsStore((s) => s.addHolding);

  const handleWatchlistToggle = useCallback(() => {
    if (isInWatchlist) {
      removeFromWatchlist(schemeCode);
    } else if (fund) {
      addToWatchlist(schemeCode, fund.meta.scheme_name);
    }
  }, [isInWatchlist, schemeCode, fund, addToWatchlist, removeFromWatchlist]);

  const handleHoldingSubmit = useCallback(
    (units: number, purchaseDate: string) => {
      if (!fund) return;
      addHolding({
        schemeCode,
        fundName: fund.meta.scheme_name,
        units,
        purchaseDate,
      });
      setHoldingFormVisible(false);
    },
    [schemeCode, fund, addHolding],
  );

  const filteredData = useMemo(() => {
    if (!fund) return [];
    return filterByTimeRange(fund.data, selectedRange);
  }, [fund, selectedRange]);

  const historyData = useMemo(() => {
    return filteredData.slice(0, 50);
  }, [filteredData]);

  const earliestNAVDate = useMemo(() => {
    if (!fund || fund.data.length === 0) return undefined;
    const lastEntry = fund.data[fund.data.length - 1];
    return parseNAVDate(lastEntry.date);
  }, [fund]);

  if (isLoading) {
    return <LoadingIndicator message="Loading fund details..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={retry} />;
  }

  if (!fund) {
    return <ErrorState message="Fund data not available" onRetry={retry} />;
  }

  const latestEntry = fund.data[0];
  const latestNAV = latestEntry ? parseFloat(latestEntry.nav) : 0;
  const latestDate = latestEntry ? parseNAVDate(latestEntry.date) : new Date();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card - Fund Info */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <ThemedText style={styles.fundCategory} themeColor="textSecondary">
            {fund.meta.scheme_category || fund.meta.scheme_type}
          </ThemedText>
          <ThemedText style={styles.fundName}>
            {fund.meta.scheme_name}
          </ThemedText>
          <ThemedText style={styles.fundHouse} themeColor="textSecondary">
            {fund.meta.fund_house}
          </ThemedText>

          <View style={styles.navContainer}>
            <View>
              <ThemedText style={styles.navLabel} themeColor="textSecondary">
                Latest NAV
              </ThemedText>
              <ThemedText style={styles.navValue}>
                ₹{formatNAV(latestNAV)}
              </ThemedText>
            </View>
            <View style={styles.navDateContainer}>
              <ThemedText style={styles.navLabel} themeColor="textSecondary">
                As on
              </ThemedText>
              <ThemedText style={styles.navDateValue}>
                {formatDisplayDate(latestDate)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleWatchlistToggle}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: isInWatchlist
                  ? "transparent"
                  : theme.backgroundElement,
                borderColor: isInWatchlist ? "#4ade80" : theme.border,
              },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
            }
          >
            <ThemedText
              style={[
                styles.actionButtonText,
                isInWatchlist && { color: "#4ade80" },
              ]}
            >
              {isInWatchlist ? "★ Watchlisted" : "☆ Watchlist"}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setHoldingFormVisible(true)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.addHoldingButton,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add holding"
          >
            <ThemedText style={styles.addHoldingButtonText}>
              + Add Holding
            </ThemedText>
          </Pressable>
        </View>

        {/* Chart Section */}
        <View
          style={[
            styles.chartSection,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <View style={styles.chartHeader}>
            <ThemedText style={styles.sectionTitle}>Performance</ThemedText>
          </View>
          <TimeRangeFilter
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />
          <NAVChart data={filteredData} maxPoints={100} />
        </View>

        {/* NAV History */}
        <View
          style={[
            styles.historySection,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <NAVHistoryList data={historyData} />
        </View>
      </ScrollView>

      {/* Holding Form Modal */}
      <HoldingForm
        visible={holdingFormVisible}
        fundName={fund.meta.scheme_name}
        earliestNAVDate={earliestNAVDate}
        onSubmit={handleHoldingSubmit}
        onClose={() => setHoldingFormVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.eight,
  },
  heroCard: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    padding: Spacing.five,
    borderRadius: BorderRadius.xl,
  },
  fundCategory: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.two,
  },
  fundName: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: Spacing.two,
  },
  fundHouse: {
    fontSize: 13,
    marginBottom: Spacing.five,
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.one,
  },
  navValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#c9a96e",
  },
  navDateContainer: {
    alignItems: "flex-end",
  },
  navDateValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  addHoldingButton: {
    backgroundColor: "#c9a96e",
    borderColor: "#c9a96e",
  },
  addHoldingButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0d0d12",
  },
  chartSection: {
    marginHorizontal: Spacing.four,
    borderRadius: BorderRadius.xl,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    marginBottom: Spacing.four,
  },
  chartHeader: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  historySection: {
    marginHorizontal: Spacing.four,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.four,
  },
});
