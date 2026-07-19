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
import { Spacing } from "@/constants/theme";
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

  const [selectedRange, setSelectedRange] = useState<TimeRange>("ALL");
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
    return filteredData.slice(0, 100);
  }, [filteredData]);

  const earliestNAVDate = useMemo(() => {
    if (!fund || fund.data.length === 0) return undefined;
    // Data is newest-first, so last element is the earliest date
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
  const showTimeRangeFilter = fund.data.length > 365;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <ThemedText style={styles.fundName}>
            {fund.meta.scheme_name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Scheme Code: {fund.meta.scheme_code}
          </ThemedText>
          <View style={styles.navRow}>
            <ThemedText style={styles.navValue}>
              ₹{formatNAV(latestNAV)}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.navDate}
            >
              {formatDisplayDate(latestDate)}
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleWatchlistToggle}
            style={[
              styles.actionButton,
              {
                backgroundColor: isInWatchlist
                  ? theme.backgroundSelected
                  : theme.backgroundElement,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isInWatchlist ? "Remove from watchlist" : "Add to watchlist"
            }
          >
            <ThemedText style={styles.actionButtonText}>
              {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setHoldingFormVisible(true)}
            style={[styles.actionButton, styles.addHoldingButton]}
            accessibilityRole="button"
            accessibilityLabel="Add holding"
          >
            <ThemedText style={styles.addHoldingButtonText}>
              Add Holding
            </ThemedText>
          </Pressable>
        </View>

        {/* Time Range Filter - only shown when > 365 entries */}
        {showTimeRangeFilter && (
          <TimeRangeFilter
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />
        )}

        {/* NAV Chart */}
        <NAVChart data={filteredData} maxPoints={100} />

        {/* NAV History List */}
        <NAVHistoryList data={historyData} />
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
    paddingBottom: Spacing.five,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  fundName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.one,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  navValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  navDate: {
    fontSize: 13,
  },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  addHoldingButton: {
    backgroundColor: "#3c87f7",
  },
  addHoldingButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
});
