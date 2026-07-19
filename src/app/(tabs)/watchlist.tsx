import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { WatchlistItem } from "@/components/watchlist/WatchlistItem";
import { Spacing } from "@/constants/theme";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { WatchlistItem as WatchlistItemType } from "@/types/fund";

export default function WatchlistScreen() {
  const router = useRouter();
  const { items, removeFromWatchlist, refreshNAVs } = useWatchlistStore();
  const [loading, setLoading] = useState(false);

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
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePress = useCallback(
    (item: WatchlistItemType) => {
      router.push(`/fund/${item.schemeCode}`);
    },
    [router],
  );

  const handleRemove = useCallback(
    (schemeCode: number) => {
      removeFromWatchlist(schemeCode);
    },
    [removeFromWatchlist],
  );

  const keyExtractor = useCallback(
    (item: WatchlistItemType) => item.schemeCode.toString(),
    [],
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
        renderItem={({ item }) => (
          <WatchlistItem
            item={item}
            onPress={handlePress}
            onRemove={handleRemove}
          />
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
