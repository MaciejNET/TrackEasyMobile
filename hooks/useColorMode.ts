import { useState } from 'react';

export function useColorMode() {
  const [colorMode, setColorMode] = useState<"dark" | "light">("dark");

  const toggleColorMode = () => {
    setColorMode(prev => prev === "dark" ? "light" : "dark");
  };

  return {
    colorMode,
    setColorMode,
    toggleColorMode,
  };
}