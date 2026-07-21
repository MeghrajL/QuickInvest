import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HoldingForm } from "@/components/fund-detail/HoldingForm";
import { NAVChart } from "@/components/fund-detail/NAVChart";
import { NAVHistoryList } from "@/components/fund-detail/NAVHistoryList";
import { TimeRangeFilter } from "@/components/fund-detail/TimeRangeFilter";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { SuccessToast } from "@/components/ui/SuccessToast";
import { BorderRadius, Colors, Overlays, Spacing } from "@/constants/theme";
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
  const router = useRouter();

  const { fund, isLoading, error, retry } = useFundDetail(schemeCode);

  const [selectedRange, setSelectedRange] = useState<TimeRange>("ALL");
  const [holdingFormVisible, setHoldingFormVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
      setShowToast(true);
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

  const hasMoreNav = filteredData.length > 50;

  const earliestNAVDate = useMemo(() => {
    if (!fund || fund.data.length === 0) return undefined;
    const lastEntry = fund.data[fund.data.length - 1];
    return parseNAVDate(lastEntry.date);
  }, [fund]);

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <LoadingIndicator message="Loading fund details..." />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <CustomHeader onBack={() => router.back()} theme={theme} />
          <ErrorState message={error} onRetry={retry} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!fund) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <CustomHeader onBack={() => router.back()} theme={theme} />
          <ErrorState message="Fund data not available" onRetry={retry} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const latestEntry = fund.data[0];
  const latestNAV = latestEntry ? parseFloat(latestEntry.nav) : 0;
  const latestDate = latestEntry ? parseNAVDate(latestEntry.date) : new Date();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom Header */}
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
            <ThemedText style={styles.headerTitle} numberOfLines={1}>
              Fund Details
            </ThemedText>
            <View style={styles.headerSpacer} />
          </View>

          {/* Hero Card - Fund Info */}
          <View
            style={[
              styles.heroCard,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            {/* Category Badge */}
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <ThemedText style={styles.categoryText} themeColor="accent">
                {fund.meta.scheme_category || fund.meta.scheme_type}
              </ThemedText>
            </View>

            <ThemedText style={styles.fundName}>
              {fund.meta.scheme_name}
            </ThemedText>

            <View style={styles.fundHouseRow}>
              <Ionicons
                name="business-outline"
                size={12}
                color={theme.textSecondary}
              />
              <ThemedText style={styles.fundHouse} themeColor="textSecondary">
                {fund.meta.fund_house}
              </ThemedText>
            </View>

            {/* NAV Section */}
            <View
              style={[
                styles.navCard,
                { backgroundColor: theme.backgroundSelected },
              ]}
            >
              <View style={styles.navMain}>
                <ThemedText style={styles.navLabel} themeColor="textSecondary">
                  LATEST NAV
                </ThemedText>
                <ThemedText style={styles.navValue}>
                  ₹{formatNAV(latestNAV)}
                </ThemedText>
              </View>
              <View style={styles.navDivider} />
              <View style={styles.navDate}>
                <ThemedText style={styles.navLabel} themeColor="textSecondary">
                  AS ON
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
                  borderColor: isInWatchlist ? theme.positive : theme.border,
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
                  isInWatchlist && { color: theme.positive },
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
            <NAVHistoryList
              data={historyData}
              hasMore={hasMoreNav}
              onViewAll={() => router.push(`/nav-history/${schemeCode}`)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Holding Form Modal */}
      <HoldingForm
        visible={holdingFormVisible}
        fundName={fund.meta.scheme_name}
        earliestNAVDate={earliestNAVDate}
        onSubmit={handleHoldingSubmit}
        onClose={() => setHoldingFormVisible(false)}
      />

      <SuccessToast
        visible={showToast}
        message="Holding added successfully"
        onDismiss={() => setShowToast(false)}
      />
    </ThemedView>
  );
}

/** Custom back button header */
function CustomHeader({ onBack, theme }: { onBack: () => void; theme: any }) {
  return (
    <View style={styles.headerBar}>
      <Pressable
        onPress={onBack}
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
      <ThemedText style={styles.headerTitle}>Fund Details</ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.eight,
  },
  // Custom Header
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
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
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 36,
  },
  // Hero Card
  heroCard: {
    marginHorizontal: Spacing.four,
    padding: Spacing.five,
    borderRadius: BorderRadius.xl,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.three,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fundName: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: Spacing.two,
  },
  fundHouseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  fundHouse: {
    fontSize: 12,
    fontWeight: "500",
  },
  // NAV Card (nested inside hero)
  navCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.four,
    alignItems: "center",
  },
  navMain: {
    flex: 1,
    gap: Spacing.one,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  navValue: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.dark.accent,
  },
  navDivider: {
    width: 1,
    height: 36,
    backgroundColor: Overlays.white10,
    marginHorizontal: Spacing.four,
  },
  navDate: {
    gap: Spacing.one,
    alignItems: "flex-end",
  },
  navDateValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  // Action Buttons
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
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  addHoldingButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.dark.background,
  },
  // Chart Section
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
  // History Section
  historySection: {
    marginHorizontal: Spacing.four,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.four,
  },
});
