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
import { Spacing } from "@/constants/theme";
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
    // Parse the date from YYYY-MM-DD string
    const parsedDate = new Date(purchaseDate);

    // Check if date string is valid format before running validation
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
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.card, { backgroundColor: theme.background }]}
          onPress={() => {}}
        >
          <ThemedText type="smallBold" style={styles.title}>
            Add Holding
          </ThemedText>

          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.fundName}
          >
            {fundName}
          </ThemedText>

          {/* Units Input */}
          <View style={styles.fieldContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: errors.units
                    ? "#DC3545"
                    : theme.backgroundElement,
                },
              ]}
              placeholder="Number of units"
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
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: errors.purchaseDate
                    ? "#DC3545"
                    : theme.backgroundElement,
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
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: theme.backgroundElement },
              ]}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.submitButton,
                { opacity: isFormFilled ? 1 : 0.5 },
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.three,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 12,
    padding: Spacing.four,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.one,
  },
  fundName: {
    marginBottom: Spacing.three,
  },
  fieldContainer: {
    marginBottom: Spacing.three,
  },
  input: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    borderWidth: 1,
  },
  errorText: {
    color: "#DC3545",
    fontSize: 12,
    marginTop: Spacing.one,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {},
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#3c87f7",
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
});

export const HoldingForm = React.memo(HoldingFormInner);
