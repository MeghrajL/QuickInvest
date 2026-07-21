import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setShowDatePicker(false);
      }
      if (event.type === "set" && date) {
        setSelectedDate(date);
        setDateSelected(true);
        if (errors.purchaseDate) {
          setErrors((prev) => ({ ...prev, purchaseDate: undefined }));
        }
      }
    },
    [errors.purchaseDate],
  );

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
                      ? "#f87171"
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
                  onChange={handleDateChange}
                  themeVariant="dark"
                  accentColor="#c9a96e"
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
                        ? "#f87171"
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
                    onChange={handleDateChange}
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
