import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';


const COLOR_MODE_KEY = 'color_mode_preference';

export function useColorMode() {
  const systemColorScheme = useColorScheme();
  const [colorModeKey, setColorModeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  
  const [colorMode, setColorModeInternal] = useState<"dark" | "light">(systemColorScheme === 'dark' ? "dark" : "light");

  
  const setColorMode = (newColorMode: "dark" | "light") => {
    setColorModeInternal(newColorMode);
    setColorModeKey(prev => prev + 1);
  };

  
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

  
  useEffect(() => {
    const checkSystemTheme = async () => {
      try {
        const storedColorMode = await SecureStore.getItemAsync(COLOR_MODE_KEY);
        
        if (!storedColorMode && systemColorScheme) {
          setColorMode(systemColorScheme === 'dark' ? "dark" : "light");
        }
      } catch (error) {
        console.error('Failed to check color mode preference:', error);
      }
    };

    checkSystemTheme();
  }, [systemColorScheme]);

  
  const toggleColorMode = async () => {
    const newColorMode = colorMode === "dark" ? "light" : "dark";
    
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
    colorModeKey, 
  };
}
