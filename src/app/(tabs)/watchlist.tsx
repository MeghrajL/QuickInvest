import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { WatchlistItem } from "@/components/watchlist/WatchlistItem";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { WatchlistItem as WatchlistItemType } from "@/types/fund";

export default function WatchlistScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { items, removeFromWatchlist, refreshNAVs } = useWatchlistStore();
  const [loading, setLoading] = useState(false);
  const [removeCode, setRemoveCode] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      if (items.length === 0) return;
      setLoading(true);
      try {
        await refreshNAVs();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePress = useCallback(
    (item: WatchlistItemType) => {
      router.push(`/fund/${item.schemeCode}`);
    },
    [router],
  );

  const handleRemove = useCallback((schemeCode: number) => {
    setRemoveCode(schemeCode);
  }, []);

  const confirmRemove = useCallback(() => {
    if (removeCode !== null) {
      removeFromWatchlist(removeCode);
      setRemoveCode(null);
    }
  }, [removeCode, removeFromWatchlist]);

  const cancelRemove = useCallback(() => {
    setRemoveCode(null);
  }, []);

  const keyExtractor = useCallback(
    (item: WatchlistItemType) => item.schemeCode.toString(),
    [],
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.headerTitle}>Your Watchlist</ThemedText>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: theme.backgroundSelected },
            ]}
          >
            <ThemedText style={styles.countText} themeColor="accent">
              {items.length}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.headerSubtitle} themeColor="textSecondary">
          Track your favourite schemes
        </ThemedText>
      </View>
    ),
    [items.length, theme.backgroundSelected],
  );

  if (loading) {
    return <LoadingIndicator message="Refreshing watchlist..." />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        message="Your watchlist is empty"
        suggestion="Search for funds and add them to your watchlist"
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <WatchlistItem
            item={item}
            onPress={handlePress}
            onRemove={handleRemove}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <ConfirmModal
        visible={removeCode !== null}
        title="Remove from Watchlist"
        message="Are you sure you want to remove this fund from your watchlist?"
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
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    marginBottom: Spacing.one,
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
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: Spacing.eight,
  },
});
