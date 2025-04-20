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

SplashScreen.preventAutoHideAsync();

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
  const { colorMode, setColorMode } = useColorMode();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const theme = colorMode === "dark" ? DarkTheme : DefaultTheme;

  return (
    <GluestackUIProvider mode={colorMode}>
      <ThemeProvider value={theme}>
        <SafeAreaProvider>
          <SafeTopView style={{backgroundColor: theme.colors.background}}>
            <GestureHandlerRootView style={{flex: 1}}>
              <Stack screenOptions={{headerShown: false}}/>
            </GestureHandlerRootView>
          </SafeTopView>
        </SafeAreaProvider>
      </ThemeProvider>
    </GluestackUIProvider>
  )
}
