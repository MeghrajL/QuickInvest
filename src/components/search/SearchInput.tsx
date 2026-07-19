import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Search mutual funds...",
}: SearchInputProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: value.length > 0 ? theme.accent : theme.border,
        },
      ]}
    >
      <Ionicons
        name="search"
        size={18}
        color={value.length > 0 ? theme.accent : theme.textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search mutual funds"
        accessibilityRole="search"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText("")}
          style={({ pressed }) => [
            styles.clearButton,
            { backgroundColor: theme.backgroundSelected },
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={8}
        >
          <Ionicons name="close" size={14} color={theme.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1.5,
  },
  icon: {
    marginRight: Spacing.three,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    padding: 0,
    fontWeight: "500",
  },
  clearButton: {
    marginLeft: Spacing.two,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
