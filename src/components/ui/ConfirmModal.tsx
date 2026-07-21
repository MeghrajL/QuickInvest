import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Colors, Overlays, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Remove",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View
          style={[styles.card, { backgroundColor: theme.backgroundElement }]}
        >
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.message} themeColor="textSecondary">
            {message}
          </ThemedText>

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.backgroundSelected },
                pressed && { opacity: 0.7 },
              ]}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <ThemedText style={styles.cancelText}>{cancelLabel}</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <ThemedText style={styles.confirmText}>{confirmLabel}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Overlays.dark75,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.six,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: Spacing.three,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.five,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  confirmButton: {
    backgroundColor: Colors.dark.negative,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark.text,
  },
});
