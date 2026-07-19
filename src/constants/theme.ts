import "@/global.css";
import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#ffffff",
    background: "#0d0d12",
    backgroundElement: "#1a1a2e",
    backgroundSelected: "#2a2a3e",
    backgroundCard: "#16162a",
    textSecondary: "#8e8e9a",
    accent: "#c9a96e",
    accentLight: "#e8d5a3",
    positive: "#4ade80",
    negative: "#f87171",
    border: "#2a2a3e",
  },
  dark: {
    text: "#ffffff",
    background: "#0d0d12",
    backgroundElement: "#1a1a2e",
    backgroundSelected: "#2a2a3e",
    backgroundCard: "#16162a",
    textSecondary: "#8e8e9a",
    accent: "#c9a96e",
    accentLight: "#e8d5a3",
    positive: "#4ade80",
    negative: "#f87171",
    border: "#2a2a3e",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 40,
  eight: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
