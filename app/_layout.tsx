import {SplashScreen, Stack } from "expo-router";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import {useEffect} from "react";
import {useFonts} from "expo-font";
import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import { View, ViewStyle } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorMode } from "@/hooks/useColorMode";
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

interface SafeTopViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

function SafeTopView({ children, style }: SafeTopViewProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, paddingTop: insets.top }, style]}>
      {children}
    </View>
  );
}

export default function RootLayout() {
  const { colorMode, setColorMode, colorModeKey } = useColorMode();

  // Using default system font instead of custom font
  useEffect(() => {
    // Hide splash screen when component mounts
    SplashScreen.hideAsync();
  }, []);

  // Using colorModeKey in the component to force re-render when color mode changes
  const theme = colorMode === "dark" ? DarkTheme : DefaultTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Using colorModeKey as a key prop to force complete re-render when color mode changes */}
        <GluestackUIProvider mode={colorMode} key={colorModeKey}>
          <ThemeProvider value={theme}>
            <SafeAreaProvider>
              <SafeTopView style={{backgroundColor: theme.colors.background}}>
                <GestureHandlerRootView style={{flex: 1}}>
                  <Stack screenOptions={{headerShown: false}}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                    <Stack.Screen name="auth/register" options={{ headerShown: false }} />
                    <Stack.Screen name="ticket/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="ticket/stations" options={{ headerShown: false }} />
                    <Stack.Screen name="ticket/cancel" options={{ headerShown: false }} />
                  </Stack>
                </GestureHandlerRootView>
              </SafeTopView>
            </SafeAreaProvider>
          </ThemeProvider>
        </GluestackUIProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
