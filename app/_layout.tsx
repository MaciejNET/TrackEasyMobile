import {SplashScreen, Stack } from "expo-router";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import {useEffect} from "react";
import {useFonts} from "expo-font";
import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native";
import { useColorMode } from "@/hooks/useColorMode";

SplashScreen.preventAutoHideAsync();

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
        <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
          <GestureHandlerRootView>
            <Stack screenOptions={{headerShown: false}}/>
          </GestureHandlerRootView>
        </SafeAreaView>
      </ThemeProvider>
    </GluestackUIProvider>
  )
}
