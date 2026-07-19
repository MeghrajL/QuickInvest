import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

import { SearchInput } from "@/components/search/SearchInput";
import { SearchResultItem } from "@/components/search/SearchResultItem";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { Spacing } from "@/constants/theme";
import { useSearchFunds } from "@/hooks/use-search-funds";
import { FundSearchResult } from "@/types/fund";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { results, isLoading, error, retry } = useSearchFunds(query);
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

  const renderContent = () => {
    // Idle state: query too short
    if (query.length < 3) {
      return (
        <ThemedView style={styles.centered}>
          <ThemedText themeColor="textSecondary" style={styles.hint}>
            Enter at least 3 characters to search
          </ThemedText>
        </ThemedView>
      );
    }

    // Loading state
    if (isLoading) {
      return <LoadingIndicator message="Searching funds..." />;
    }

    // Error state
    if (error) {
      return <ErrorState message={error} onRetry={retry} />;
    }

    // Empty state: query valid but no results
    if (results.length === 0) {
      return (
        <EmptyState
          message="No funds found"
          suggestion="Try a different search term"
        />
      );
    }

    // Results state
    return (
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="on-drag"
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
  },
  hint: {
    fontSize: 14,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
});
