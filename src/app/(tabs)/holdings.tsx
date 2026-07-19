import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

import { HoldingItem } from "@/components/holdings/HoldingItem";
import { ThemedView } from "@/components/themed-view";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Spacing } from "@/constants/theme";
import { useHoldingsStore } from "@/stores/holdings-store";
import { HoldingRecord } from "@/types/fund";

export default function HoldingsScreen() {
  const { holdings, removeHolding, refreshHoldings } = useHoldingsStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      if (holdings.length === 0) return;
      setLoading(true);
      try {
        await refreshHoldings();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    refresh();

    return () => {
      mounted = false;
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = useCallback(
    (id: string) => {
      removeHolding(id);
    },
    [removeHolding],
  );

  const keyExtractor = useCallback((item: HoldingRecord) => item.id, []);

  if (loading) {
    return <LoadingIndicator message="Refreshing holdings..." />;
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
        renderItem={({ item }) => (
          <HoldingItem holding={item} onRemove={handleRemove} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: Spacing.two,
  },
});
