import { ActivityIndicator, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({
  message = "Loading...",
}: LoadingIndicatorProps) {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" color="#c9a96e" />
      <ThemedText style={styles.message} themeColor="textSecondary">
        {message}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.six,
  },
  message: {
    marginTop: Spacing.four,
    fontSize: 14,
    fontWeight: "500",
  },
});
