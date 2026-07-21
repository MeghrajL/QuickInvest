import React, { useEffect } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface SuccessToastProps {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function SuccessToast({
  visible,
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 4000,
}: SuccessToastProps) {
  const theme = useTheme();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: Colors.dark.positive,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <ThemedText style={styles.icon}>✓</ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>
        {actionLabel && onAction && (
          <Pressable
            onPress={() => {
              hideToast();
              onAction();
            }}
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            hitSlop={8}
          >
            <ThemedText style={styles.actionText} themeColor="accent">
              {actionLabel}
            </ThemedText>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toast: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 14,
    color: Colors.dark.positive,
    fontWeight: "700",
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
