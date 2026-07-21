import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Colors, Overlays, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { validateHoldingForm } from "@/utils/validation";

interface HoldingFormProps {
  visible: boolean;
  fundName: string;
  earliestNAVDate?: Date;
  onSubmit: (units: number, purchaseDate: string) => void;
  onClose: () => void;
}

function formatDateDisplay(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateSelected, setDateSelected] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{
    units?: string;
    purchaseDate?: string;
  }>({});

  const resetForm = useCallback(() => {
    setUnits("");
    setSelectedDate(new Date());
    setDateSelected(false);
    setShowDatePicker(false);
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleDateChange = useCallback(
    (...args: any[]) => {
      // Handle both (event, date) and (date) signatures across versions
      let newDate: Date | undefined;
      if (args[0] instanceof Date) {
        newDate = args[0];
      } else if (args[1] instanceof Date) {
        newDate = args[1];
      }

      if (!newDate) return;

      setSelectedDate(newDate);
      setDateSelected(true);
      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }
      if (errors.purchaseDate) {
        setErrors((prev) => ({ ...prev, purchaseDate: undefined }));
      }
    },
    [errors.purchaseDate],
  );

  const handleDatePickerDismiss = useCallback(() => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!dateSelected) {
      setErrors((prev) => ({
        ...prev,
        purchaseDate: "Please select a purchase date",
      }));
      return;
    }

    const result = validateHoldingForm(units, selectedDate, earliestNAVDate);

    if (!result.isValid) {
      setErrors(result.errors);
      return;
    }

    const parsedUnits = Number(units);
    onSubmit(parsedUnits, formatDateDisplay(selectedDate));
    resetForm();
  }, [units, selectedDate, dateSelected, earliestNAVDate, onSubmit, resetForm]);

  const isFormFilled = units.trim().length > 0 && dateSelected;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
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
                    borderColor: errors.units
                      ? Colors.dark.negative
                      : "transparent",
                  },
                ]}
                placeholder="e.g. 100.5"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                maxLength={10}
                value={units}
                onChangeText={(text) => {
                  setUnits(text);
                  const parsed = Number(text);
                  if (!isNaN(parsed) && parsed > 10000000) {
                    setErrors((prev) => ({
                      ...prev,
                      units: "Units cannot exceed 1,00,00,000",
                    }));
                  } else if (errors.units) {
                    setErrors((prev) => ({ ...prev, units: undefined }));
                  }
                }}
                accessibilityLabel="Number of units"
              />
              {errors.units && (
                <ThemedText style={styles.errorText}>{errors.units}</ThemedText>
              )}
            </View>

            {/* Purchase Date Picker */}
            <View style={styles.fieldContainer}>
              <ThemedText style={styles.fieldLabel} themeColor="textSecondary">
                Purchase Date
              </ThemedText>

              {Platform.OS === "ios" ? (
                // iOS: inline date picker
                <View
                  style={[
                    styles.datePickerContainer,
                    {
                      backgroundColor: theme.backgroundSelected,
                      borderColor: errors.purchaseDate
                        ? Colors.dark.negative
                        : "transparent",
                    },
                  ]}
                >
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="compact"
                    maximumDate={new Date()}
                    minimumDate={earliestNAVDate}
                    onValueChange={handleDateChange as any}
                    themeVariant="dark"
                    accentColor={Colors.dark.accent}
                  />
                </View>
              ) : (
                // Android: button that opens picker
                <>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    style={[
                      styles.input,
                      styles.dateButton,
                      {
                        backgroundColor: theme.backgroundSelected,
                        borderColor: errors.purchaseDate
                          ? Colors.dark.negative
                          : "transparent",
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.dateButtonText,
                        !dateSelected && { color: theme.textSecondary },
                      ]}
                    >
                      {dateSelected
                        ? formatDateDisplay(selectedDate)
                        : "Select date"}
                    </ThemedText>
                  </Pressable>
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      minimumDate={earliestNAVDate}
                      onValueChange={handleDateChange as any}
                      onDismiss={handleDatePickerDismiss}
                    />
                  )}
                </>
              )}

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
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: Overlays.dark70,
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
    backgroundColor: Overlays.white20,
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
  datePickerContainer: {
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },
  dateButton: {
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: Colors.dark.negative,
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
    backgroundColor: Colors.dark.accent,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.dark.background,
  },
});

export const HoldingForm = React.memo(HoldingFormInner);
