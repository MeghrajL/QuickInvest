import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FundSearchResult } from '@/types/fund';

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
        { borderBottomColor: theme.backgroundElement },
        pressed && { backgroundColor: theme.backgroundElement },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.schemeName}, scheme code ${item.schemeCode}`}
    >
      <View style={styles.content}>
        <ThemedText style={styles.schemeName} numberOfLines={2}>
          {item.schemeName}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Code: {item.schemeCode}
        </ThemedText>
      </View>
      <ThemedText themeColor="textSecondary" style={styles.chevron}>
        ›
      </ThemedText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  schemeName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    marginLeft: Spacing.two,
  },
});
