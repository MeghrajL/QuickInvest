import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import { SearchInput } from "@/components/search/SearchInput";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import { ThemedView } from "@/components/themed-view";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Spacing } from "@/constants/theme";
import { useSearchFunds } from "@/hooks/use-search-funds";
import { FundSearchResult } from "@/types/fund";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { results, isLoading, isLoadingMore, error, hasMore, loadMore, retry } =
    useSearchFunds(query);
  const router = useRouter();

  const handleResultPress = useCallback(
    (item: FundSearchResult) => {
      router.push(`/fund/${item.schemeCode}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: FundSearchResult }) => (
      <SearchResultItem item={item} onPress={handleResultPress} />
    ),
    [handleResultPress],
  );

  const keyExtractor = useCallback(
    (item: FundSearchResult) => item.schemeCode.toString(),
    [],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }, [isLoadingMore]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const renderContent = () => {
    if (isLoading && results.length === 0) {
      return <LoadingIndicator message="Loading funds..." />;
    }

    if (error && results.length === 0) {
      return <ErrorState message={error} onRetry={retry} />;
    }

    if (results.length === 0 && query.length >= 3) {
      return (
        <EmptyState
          message="No funds found"
          suggestion="Try a different search term"
        />
      );
    }

    return (
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SearchInput value={query} onChangeText={setQuery} />
      {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  footer: {
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
});
