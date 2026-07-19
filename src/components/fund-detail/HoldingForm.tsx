import React, { useCallback, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { validateHoldingForm } from "@/utils/validation";

interface HoldingFormProps {
  visible: boolean;
  fundName: string;
  earliestNAVDate?: Date;
  onSubmit: (units: number, purchaseDate: string) => void;
  onClose: () => void;
}

function HoldingFormInner({
  visible,
  fundName,
  earliestNAVDate,
  onSubmit,
  onClose,
}: HoldingFormProps) {
  const theme = useTheme();
  const [units, setUnits] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [errors, setErrors] = useState<{
    units?: string;
    purchaseDate?: string;
  }>({});

  const resetForm = useCallback(() => {
    setUnits("");
    setPurchaseDate("");
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(() => {
    const parsedDate = new Date(purchaseDate);

    if (isNaN(parsedDate.getTime())) {
      setErrors((prev) => ({
        ...prev,
        purchaseDate: "Please enter a valid date in YYYY-MM-DD format",
      }));
      return;
    }

    const result = validateHoldingForm(units, parsedDate, earliestNAVDate);

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    const parsedUnits = Number(units);
    onSubmit(parsedUnits, purchaseDate);
    resetForm();
  }, [units, purchaseDate, earliestNAVDate, onSubmit, resetForm]);

  const isFormFilled =
    units.trim().length > 0 && purchaseDate.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.card, { backgroundColor: theme.backgroundElement }]}
          onPress={() => {}}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          <ThemedText style={styles.title}>Add Holding</ThemedText>

          <ThemedText style={styles.fundName} themeColor="textSecondary">
            {fundName}
          </ThemedText>

          {/* Units Input */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.fieldLabel} themeColor="textSecondary">
              Units
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSelected,
                  color: theme.text,
                  borderColor: errors.units ? "#f87171" : "transparent",
                },
              ]}
              placeholder="e.g. 100.5"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={units}
              onChangeText={(text) => {
                setUnits(text);
                if (errors.units) {
                  setErrors((prev) => ({ ...prev, units: undefined }));
                }
              }}
              accessibilityLabel="Number of units"
            />
            {errors.units && (
              <ThemedText style={styles.errorText}>{errors.units}</ThemedText>
            )}
          </View>

          {/* Purchase Date Input */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.fieldLabel} themeColor="textSecondary">
              Purchase Date
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSelected,
                  color: theme.text,
                  borderColor: errors.purchaseDate ? "#f87171" : "transparent",
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              value={purchaseDate}
              onChangeText={(text) => {
                setPurchaseDate(text);
                if (errors.purchaseDate) {
                  setErrors((prev) => ({ ...prev, purchaseDate: undefined }));
                }
              }}
              accessibilityLabel="Purchase date"
            />
            {errors.purchaseDate && (
              <ThemedText style={styles.errorText}>
                {errors.purchaseDate}
              </ThemedText>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.backgroundSelected },
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.submitButton,
                { opacity: isFormFilled ? (pressed ? 0.8 : 1) : 0.4 },
              ]}
              onPress={handleSubmit}
              disabled={!isFormFilled}
              accessibilityRole="button"
              accessibilityLabel="Submit holding"
            >
              <ThemedText style={styles.submitButtonText}>
                Add Holding
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  card: {
    width: "100%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.five,
    paddingBottom: Platform.OS === "ios" ? Spacing.eight : Spacing.six,
    paddingTop: Spacing.three,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: Spacing.five,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: Spacing.two,
  },
  fundName: {
    fontSize: 13,
    marginBottom: Spacing.five,
  },
  fieldContainer: {
    marginBottom: Spacing.four,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  input: {
    height: 50,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.four,
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    fontWeight: "500",
    marginTop: Spacing.two,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#c9a96e",
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0d0d12",
  },
});

export const HoldingForm = React.memo(HoldingFormInner);
