import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { AvatarColors, BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { HoldingRecord } from "@/types/fund";
import {
  formatINR,
  formatNAV,
  formatPercentage,
  formatUnits,
  getReturnColor,
} from "@/utils/format";

interface HoldingItemProps {
  holding: HoldingRecord;
  onPress: (holding: HoldingRecord) => void;
  onRemove: (id: string) => void;
}

function getAvatarColor(name: string): string {
  const colors = AvatarColors;
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

export const HoldingItem = React.memo(function HoldingItem({
  holding,
  onPress,
  onRemove,
}: HoldingItemProps) {
  const theme = useTheme();

  const handleRemove = useCallback(() => {
    onRemove(holding.id);
  }, [holding.id, onRemove]);

  const handlePress = useCallback(() => {
    onPress(holding);
  }, [holding, onPress]);

  const hasReturn =
    holding.returnAmount != null && holding.returnPercentage != null;
  const isPositive = hasReturn && holding.returnAmount! >= 0;
  const returnColor = hasReturn
    ? getReturnColor(holding.returnAmount!)
    : undefined;
  const avatarColor = getAvatarColor(holding.fundName);
  const initials = getInitials(holding.fundName);

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
      accessibilityLabel={`Holding: ${holding.fundName}, ${formatUnits(holding.units)} units`}
    >
      {/* Top Row: Avatar + Name + Remove */}
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: avatarColor + "20" }]}>
          <ThemedText style={[styles.avatarText, { color: avatarColor }]}>
            {initials}
          </ThemedText>
        </View>
        <View style={styles.nameContainer}>
          <ThemedText style={styles.fundName} numberOfLines={2}>
            {holding.fundName}
          </ThemedText>
          <ThemedText style={styles.units} themeColor="textSecondary">
            {formatUnits(holding.units)} units
          </ThemedText>
        </View>
        <Pressable
          onPress={handleRemove}
          style={({ pressed }) => [
            styles.removeButton,
            { backgroundColor: theme.backgroundSelected },
            pressed && { opacity: 0.7 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${holding.fundName} from holdings`}
          hitSlop={8}
        >
          <Ionicons
            name="trash-outline"
            size={14}
            color={Colors.dark.negative}
          />
        </Pressable>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* Bottom Row: NAV info + Returns */}
      <View style={styles.bottomRow}>
        {/* Left: NAV details */}
        <View style={styles.navDetails}>
          <View style={styles.navItem}>
            <ThemedText style={styles.navLabel} themeColor="textSecondary">
              Buy NAV
            </ThemedText>
            <ThemedText style={styles.navItemValue}>
              {holding.purchaseNAV != null
                ? `₹${formatNAV(holding.purchaseNAV)}`
                : "—"}
            </ThemedText>
          </View>
          <View style={styles.navItem}>
            <ThemedText style={styles.navLabel} themeColor="textSecondary">
              Current NAV
            </ThemedText>
            <ThemedText style={styles.navItemValue}>
              {holding.currentNAV != null
                ? `₹${formatNAV(holding.currentNAV)}`
                : "—"}
            </ThemedText>
          </View>
        </View>

        {/* Right: Current Value + Returns */}
        <View style={styles.returnsContainer}>
          {holding.currentValue != null && (
            <ThemedText style={styles.currentValue}>
              {formatINR(holding.currentValue)}
            </ThemedText>
          )}
          {hasReturn ? (
            <View
              style={[
                styles.returnBadge,
                { backgroundColor: returnColor + "18" },
              ]}
            >
              <ThemedText style={[styles.returnText, { color: returnColor }]}>
                {isPositive ? "↑" : "↓"}{" "}
                {formatPercentage(holding.returnPercentage!)}
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.unavailable} themeColor="textSecondary">
              Computing...
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.three,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.three,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "800",
  },
  nameContainer: {
    flex: 1,
    gap: 2,
  },
  fundName: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  units: {
    fontSize: 11,
    fontWeight: "500",
  },
  removeButton: {
    marginLeft: Spacing.two,
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  navDetails: {
    gap: Spacing.two,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    width: 72,
  },
  navItemValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  returnsContainer: {
    alignItems: "flex-end",
    gap: Spacing.two,
  },
  currentValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.dark.accent,
  },
  returnBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.full,
  },
  returnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  unavailable: {
    fontSize: 11,
    fontStyle: "italic",
  },
});
