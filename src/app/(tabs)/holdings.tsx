import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

import { HoldingItem } from "@/components/holdings/HoldingItem";
import { ThemedView } from "@/components/themed-view";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Spacing } from "@/constants/theme";
import { useHoldingsStore } from "@/stores/holdings-store";
import { HoldingRecord } from "@/types/fund";

export default function HoldingsScreen() {
  const { holdings, removeHolding, refreshHoldings } = useHoldingsStore();
  const [loading, setLoading] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const hasRefreshed = useRef(false);

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
        renderItem={({ item }) => (
          <HoldingItem holding={item} onRemove={handleRemove} />
        )}
        contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingVertical: Spacing.two,
  },
});
