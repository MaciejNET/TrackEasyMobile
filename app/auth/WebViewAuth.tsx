import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorMode } from '@/hooks/useColorMode';

interface WebViewAuthProps {
  url: string;
  provider: 'google' | 'microsoft';
  onCancel: () => void;
}

export default function WebViewAuth({ url, provider, onCancel }: WebViewAuthProps) {
  const router = useRouter();
  const { handleExternalLoginCallback } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colorMode } = useColorMode();

  // Define theme-based styles
  const isDark = colorMode === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const bgColor = isDark ? "bg-black" : "bg-white";

  // Handle navigation state change
  const handleNavigationStateChange = async (navState: any) => {
    console.log('WebView navigation state changed:', navState);

    // Check if the URL contains the callback path
    if (navState.url.includes('/users/external/' + provider + '/callback')) {
      console.log('Detected callback URL:', navState.url);
      setIsLoading(true);

      try {
        // Call the handleExternalLoginCallback method
        await handleExternalLoginCallback(provider);
        console.log('External login callback successful, redirecting to home');
        router.replace('/(tabs)');
      } catch (err: any) {
        console.error('External login callback failed:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        setIsLoading(false);
      }
    }
  };

  if (error) {
    return (
      <Box className={`flex-1 p-6 justify-center ${bgColor}`}>
        <Box className={`mb-8 p-4 ${isDark ? 'bg-red-900' : 'bg-red-100'} rounded-md`}>
          <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-red-700'}`}>
            Authentication Failed
          </Text>
          <Text className={isDark ? 'text-white' : 'text-red-700'}>{error}</Text>
        </Box>
        <Button
          onPress={onCancel}
          className={isDark ? 'bg-blue-700' : 'bg-blue-600'}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </Button>
      </Box>
    );
  }

  return (
    <Box className="flex-1">
      <Box className="flex-row justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
        <Text className={`font-bold ${textColor}`}>
          Sign in with {provider === 'google' ? 'Google' : 'Microsoft'}
        </Text>
        <Button
          onPress={onCancel}
          variant="outline"
          size="sm"
        >
          <Text className={textColor}>Cancel</Text>
        </Button>
      </Box>

      <WebView
        source={{ uri: url }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <Box className="absolute inset-0 flex justify-center items-center bg-white dark:bg-black bg-opacity-70 dark:bg-opacity-70">
            <Spinner size="large" color={isDark ? "white" : "black"} />
            <Text className={`mt-4 ${textColor}`}>Loading...</Text>
          </Box>
        )}
      />

      {isLoading ? (
        <Box className="absolute inset-0 flex justify-center items-center bg-white dark:bg-black bg-opacity-70 dark:bg-opacity-70">
          <Spinner size="large" color={isDark ? "white" : "black"} />
          <Text className={`mt-4 ${textColor}`}>Loading...</Text>
        </Box>
      ) : null}
    </Box>
  );
}
