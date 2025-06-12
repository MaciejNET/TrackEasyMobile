import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Key for storing color mode preference
const COLOR_MODE_KEY = 'color_mode_preference';

export function useColorMode() {
  const systemColorScheme = useColorScheme();
  const [colorModeKey, setColorModeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Custom setColorMode function that also updates the colorModeKey
  const [colorMode, setColorModeInternal] = useState<"dark" | "light">(systemColorScheme === 'dark' ? "dark" : "light");

  // Wrapper for setColorMode that also increments the key to force re-render
  const setColorMode = (newColorMode: "dark" | "light") => {
    setColorModeInternal(newColorMode);
    setColorModeKey(prev => prev + 1);
  };

  // Load color mode preference from SecureStore on mount
  useEffect(() => {
    const loadColorMode = async () => {
      try {
        const storedColorMode = await SecureStore.getItemAsync(COLOR_MODE_KEY);
        if (storedColorMode === 'dark' || storedColorMode === 'light') {
          setColorMode(storedColorMode);
        }
      } catch (error) {
        console.error('Failed to load color mode preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadColorMode();
  }, []);

  // Update colorMode when system theme changes, but only if no preference is stored
  useEffect(() => {
    const checkSystemTheme = async () => {
      try {
        const storedColorMode = await SecureStore.getItemAsync(COLOR_MODE_KEY);
        // Only use system theme if no preference is stored
        if (!storedColorMode && systemColorScheme) {
          setColorMode(systemColorScheme === 'dark' ? "dark" : "light");
        }
      } catch (error) {
        console.error('Failed to check color mode preference:', error);
      }
    };

    checkSystemTheme();
  }, [systemColorScheme]);

  // Toggle color mode and save preference to SecureStore
  const toggleColorMode = async () => {
    const newColorMode = colorMode === "dark" ? "light" : "dark";
    // Use the wrapper setColorMode function which already increments the key
    setColorMode(newColorMode);

    try {
      await SecureStore.setItemAsync(COLOR_MODE_KEY, newColorMode);
    } catch (error) {
      console.error('Failed to save color mode preference:', error);
    }
  };

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
    isLoading,
    colorModeKey, // Export the key for use in the root layout
  };
}
