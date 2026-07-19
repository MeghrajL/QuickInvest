import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { useAppRefresh } from "@/hooks/use-app-refresh";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Refresh watchlist and holdings data when app returns to foreground
  useAppRefresh();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="fund/[schemeCode]"
          options={{
            title: "Fund Details",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
