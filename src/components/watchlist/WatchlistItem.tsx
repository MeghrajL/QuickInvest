import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { WatchlistItem as WatchlistItemType } from "@/types/fund";
import { formatDisplayDate, parseNAVDate } from "@/utils/date";
import { formatNAV } from "@/utils/format";

interface WatchlistItemProps {
  item: WatchlistItemType;
  onPress: (item: WatchlistItemType) => void;
  onRemove: (schemeCode: number) => void;
}

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

export const WatchlistItem = React.memo(function WatchlistItem({
  item,
  onPress,
  onRemove,
}: WatchlistItemProps) {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const handleRemove = useCallback(() => {
    onRemove(item.schemeCode);
  }, [item.schemeCode, onRemove]);

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
      accessibilityLabel={item.schemeName}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor + "20" }]}>
        <ThemedText style={[styles.avatarText, { color: avatarColor }]}>
          {initials}
        </ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <ThemedText style={styles.fundName} numberOfLines={2}>
            {item.schemeName}
          </ThemedText>
        </View>

        <View style={styles.navRow}>
          {item.latestNAV != null ? (
            <View style={styles.navInfo}>
              <ThemedText style={styles.navValue}>
                ₹{formatNAV(item.latestNAV)}
              </ThemedText>
              {item.lastUpdated && (
                <ThemedText style={styles.navDate} themeColor="textSecondary">
                  {formatDisplayDate(parseNAVDate(item.lastUpdated))}
                </ThemedText>
              )}
            </View>
          ) : (
            <ThemedText style={styles.navPending} themeColor="textSecondary">
              Loading NAV...
            </ThemedText>
          )}
        </View>
      </View>

      {/* Remove Button */}
      <Pressable
        onPress={handleRemove}
        style={({ pressed }) => [
          styles.removeButton,
          { backgroundColor: theme.backgroundSelected },
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.schemeName} from watchlist`}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={16} color="#f87171" />
      </Pressable>
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
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  fundName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    flexShrink: 1,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  navInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  navValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#c9a96e",
  },
  navDate: {
    fontSize: 11,
    fontWeight: "500",
  },
  navPending: {
    fontSize: 12,
    fontStyle: "italic",
  },
  removeButton: {
    marginLeft: Spacing.three,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
});
