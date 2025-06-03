import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export function useColorMode() {
  const systemColorScheme = useColorScheme();
  const [colorMode, setColorMode] = useState<"dark" | "light">(systemColorScheme === 'dark' ? "dark" : "light");

  // Update colorMode when system theme changes
  useEffect(() => {
    if (systemColorScheme) {
      setColorMode(systemColorScheme === 'dark' ? "dark" : "light");
    }
  }, [systemColorScheme]);

  const toggleColorMode = () => {
    setColorMode(prev => prev === "dark" ? "light" : "dark");
  };

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
  };
}
