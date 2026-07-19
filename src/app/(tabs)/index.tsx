import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import { SearchInput } from "@/components/search/SearchInput";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Spacing } from "@/constants/theme";
import { useSearchFunds } from "@/hooks/use-search-funds";
import { useTheme } from "@/hooks/use-theme";
import { FundSearchResult } from "@/types/fund";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { results, isLoading, isLoadingMore, error, hasMore, loadMore, retry } =
    useSearchFunds(query);
  const router = useRouter();
  const theme = useTheme();

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
        <ActivityIndicator size="small" color="#c9a96e" />
        <ThemedText style={styles.footerText} themeColor="textSecondary">
          Loading more...
        </ThemedText>
      </View>
    );
  }, [isLoadingMore]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const renderHeader = () => {
    if (query.length >= 3) {
      if (!isLoading && results.length > 0) {
        return (
          <View style={styles.resultHeader}>
            <ThemedText style={styles.resultCount} themeColor="textSecondary">
              {results.length} results found
            </ThemedText>
          </View>
        );
      }
      return null;
    }

    return (
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ThemedText style={styles.sectionTitle} themeColor="textSecondary">
            All Schemes
          </ThemedText>
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.backgroundSelected },
            ]}
          >
            <ThemedText style={styles.badgeText} themeColor="textSecondary">
              {results.length}+
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading && results.length === 0) {
      return <LoadingIndicator message="Loading funds..." />;
    }

    if (isLoading && query.length >= 3) {
      return <LoadingIndicator message="Searching..." />;
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
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
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
  sectionHeader: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  resultHeader: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: Spacing.eight,
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
