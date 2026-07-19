import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { FundSearchResult } from "@/types/fund";

interface SearchResultItemProps {
  item: FundSearchResult;
  onPress: (item: FundSearchResult) => void;
}

export const SearchResultItem = React.memo(function SearchResultItem({
  item,
  onPress,
}: SearchResultItemProps) {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.backgroundElement },
        pressed && {
          backgroundColor: theme.backgroundSelected,
          transform: [{ scale: 0.98 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.schemeName}, scheme code ${item.schemeCode}`}
    >
      <View style={styles.content}>
        <ThemedText style={styles.schemeName} numberOfLines={2}>
          {item.schemeName}
        </ThemedText>
        <ThemedText style={styles.schemeCode} themeColor="textSecondary">
          {item.schemeCode}
        </ThemedText>
      </View>
      <ThemedText themeColor="accent" style={styles.chevron}>
        →
      </ThemedText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    borderRadius: BorderRadius.md,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  schemeName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  schemeCode: {
    fontSize: 12,
  },
  chevron: {
    fontSize: 18,
    marginLeft: Spacing.three,
    fontWeight: "300",
  },
});
