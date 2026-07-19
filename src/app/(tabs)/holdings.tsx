import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { HoldingItem } from "@/components/holdings/HoldingItem";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useHoldingsStore } from "@/stores/holdings-store";
import { HoldingRecord } from "@/types/fund";
import { formatINR } from "@/utils/format";

export default function HoldingsScreen() {
  const { holdings, removeHolding, refreshHoldings } = useHoldingsStore();
  const [loading, setLoading] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const hasRefreshed = useRef(false);
  const theme = useTheme();
  const router = useRouter();

  const handlePress = useCallback(
    (item: HoldingRecord) => {
      router.push(`/fund/${item.schemeCode}`);
    },
    [router],
  );

  useEffect(() => {
    if (hasRefreshed.current) return;
    if (holdings.length === 0) return;

    const needsRefresh = holdings.some(
      (h) => h.returnAmount == null && h.currentNAV == null,
    );
    if (!needsRefresh && hasRefreshed.current) return;

    hasRefreshed.current = true;

    async function refresh() {
      setLoading(true);
      try {
        await refreshHoldings();
      } finally {
        setLoading(false);
      }
    }

    refresh();
  }, [holdings, refreshHoldings]);

  // Compute portfolio summary
  const summary = useMemo(() => {
    let totalValue = 0;
    let totalReturn = 0;

    holdings.forEach((h) => {
      if (h.currentValue != null) totalValue += h.currentValue;
      if (h.returnAmount != null) totalReturn += h.returnAmount;
    });

    return { totalValue, totalReturn };
  }, [holdings]);

  const handleRemove = useCallback((id: string) => {
    setRemoveId(id);
  }, []);

  const confirmRemove = useCallback(() => {
    if (removeId) {
      removeHolding(removeId);
      setRemoveId(null);
    }
  }, [removeId, removeHolding]);

  const cancelRemove = useCallback(() => {
    setRemoveId(null);
  }, []);

  const keyExtractor = useCallback((item: HoldingRecord) => item.id, []);

  const renderHeader = useCallback(() => {
    const hasData = holdings.some((h) => h.currentValue != null);

    return (
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <ThemedText style={styles.headerTitle}>Your Holdings</ThemedText>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: theme.backgroundSelected },
            ]}
          >
            <ThemedText style={styles.countText} themeColor="accent">
              {holdings.length}
            </ThemedText>
          </View>
        </View>

        {hasData && (
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <View style={styles.summaryItem}>
              <ThemedText
                style={styles.summaryLabel}
                themeColor="textSecondary"
              >
                Portfolio Value
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                {formatINR(summary.totalValue)}
              </ThemedText>
            </View>
            <View
              style={[styles.summaryDivider, { backgroundColor: theme.border }]}
            />
            <View style={styles.summaryItem}>
              <ThemedText
                style={styles.summaryLabel}
                themeColor="textSecondary"
              >
                Total Returns
              </ThemedText>
              <ThemedText
                style={[
                  styles.summaryReturn,
                  {
                    color: summary.totalReturn >= 0 ? "#4ade80" : "#f87171",
                  },
                ]}
              >
                {summary.totalReturn >= 0 ? "+" : ""}
                {formatINR(summary.totalReturn)}
              </ThemedText>
            </View>
          </View>
        )}
      </View>
    );
  }, [holdings, summary, theme]);

  if (loading && holdings.every((h) => h.returnAmount == null)) {
    return <LoadingIndicator message="Computing returns..." />;
  }

  if (holdings.length === 0) {
    return (
      <EmptyState
        message="No holdings recorded"
        suggestion="Open a fund and tap 'Add Holding' to track your investments"
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={holdings}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <HoldingItem
            holding={item}
            onPress={handlePress}
            onRemove={handleRemove}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <ConfirmModal
        visible={removeId !== null}
        title="Remove Holding"
        message="Are you sure you want to remove this holding? This action cannot be undone."
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.three,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  countBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: "800",
  },
  summaryCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
  },
  summaryItem: {
    flex: 1,
    gap: Spacing.two,
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: Spacing.three,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#c9a96e",
  },
  summaryReturn: {
    fontSize: 18,
    fontWeight: "800",
  },
  listContent: {
    paddingBottom: Spacing.eight,
  },
});
