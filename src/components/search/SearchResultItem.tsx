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

/**
 * Generates a consistent color based on the scheme name for the avatar.
 */
function getAvatarColor(name: string): string {
  const colors = [
    "#c9a96e",
    "#4ade80",
    "#60a5fa",
    "#f472b6",
    "#a78bfa",
    "#fb923c",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const words = name.split(" ").filter((w) => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export const SearchResultItem = React.memo(function SearchResultItem({
  item,
  onPress,
}: SearchResultItemProps) {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const avatarColor = getAvatarColor(item.schemeName);
  const initials = getInitials(item.schemeName);

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
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor + "20" }]}>
        <ThemedText style={[styles.avatarText, { color: avatarColor }]}>
          {initials}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText style={styles.schemeName} numberOfLines={2}>
          {item.schemeName}
        </ThemedText>
        <ThemedText style={styles.schemeCode} themeColor="textSecondary">
          Scheme #{item.schemeCode}
        </ThemedText>
      </View>

      {/* Chevron */}
      <View
        style={[
          styles.chevronContainer,
          { backgroundColor: theme.backgroundSelected },
        ]}
      >
        <ThemedText style={styles.chevron} themeColor="textSecondary">
          ›
        </ThemedText>
      </View>
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
    borderRadius: BorderRadius.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.three,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  schemeName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
  },
  schemeCode: {
    fontSize: 11,
    fontWeight: "500",
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.two,
  },
  chevron: {
    fontSize: 16,
    fontWeight: "600",
  },
});
