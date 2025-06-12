import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useColorMode } from '@/hooks/useColorMode';

export default function ExternalCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ provider: string }>();
  const provider = params.provider;
  const { handleExternalLoginCallback } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colorMode } = useColorMode();

  // Define theme-based styles
  const isDark = colorMode === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const bgColor = isDark ? "bg-black" : "bg-white";

  useEffect(() => {
    const handleCallback = async () => {
      if (!provider) {
        console.error('Provider not specified in callback');
        setError('Provider not specified. Please try again from the login screen.');
        setIsLoading(false);
        return;
      }

      console.log('Handling callback for provider:', provider);

      // Validate provider
      if (provider !== 'google' && provider !== 'microsoft') {
        console.error('Invalid provider in callback:', provider);
        setError(`Invalid provider: ${provider}. Please try again with Google or Microsoft.`);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Calling handleExternalLoginCallback with provider:', provider);
        await handleExternalLoginCallback(provider);
        console.log('External login callback successful, redirecting to home');
        router.replace('/(tabs)');
      } catch (err: any) {
        console.error('External login callback failed:', err);

        // Provide more user-friendly error messages based on the error
        if (err.message.includes('500')) {
          setError('The server encountered an error. Please try again later.');
        } else if (err.message.includes('timeout')) {
          setError('The request timed out. Please check your internet connection and try again.');
        } else if (err.message.includes('Network Error')) {
          setError('Network error. Please check your internet connection and try again.');
        } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          setError('Authentication failed. Please try again.');
        } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
          setError('You do not have permission to access this resource. Please contact support.');
        } else if (err.message.includes('404') || err.message.includes('Not found')) {
          setError('The requested resource could not be found. Please try again later.');
        } else {
          setError(err.message || 'Authentication failed. Please try again.');
        }

        setIsLoading(false);
      }
    };

    // Add a timeout to prevent the loading state from being stuck indefinitely
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Callback handling timed out after 15 seconds');
        setError('The request timed out. Please try again later.');
        setIsLoading(false);
      }
    }, 15000); // 15 seconds timeout

    handleCallback();

    // Clean up the timeout when the component unmounts
    return () => clearTimeout(timeoutId);
  }, [provider, handleExternalLoginCallback, router, isLoading]);

  if (isLoading) {
    return (
      <Box className={`flex-1 justify-center items-center ${bgColor}`}>
        <Spinner size="large" color={isDark ? "white" : "black"} />
        <Text className={`mt-4 ${textColor}`}>Completing authentication...</Text>
      </Box>
    );
  }

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
          onPress={() => router.replace('/auth/login')}
          className={isDark ? 'bg-blue-700' : 'bg-blue-600'}
        >
          <Text className="text-white font-medium">Return to Login</Text>
        </Button>
      </Box>
    );
  }

  return (
    <Box className={`flex-1 justify-center items-center ${bgColor}`}>
      <Text className={`text-xl font-bold mb-4 ${textColor}`}>Authentication Successful</Text>
      <Text className={`mb-8 ${textColor}`}>Redirecting to home screen...</Text>
      <Button
        onPress={() => router.replace('/(tabs)')}
        className={isDark ? 'bg-blue-700' : 'bg-blue-600'}
      >
        <Text className="text-white font-medium">Go to Home</Text>
      </Button>
    </Box>
  );
}
