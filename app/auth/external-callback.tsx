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
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params.token;
  const { handleExternalLoginCallback } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colorMode } = useColorMode();

  
  const isDark = colorMode === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const bgColor = isDark ? "bg-black" : "bg-white";

  useEffect(() => {
    const handleCallback = async () => {
      if (!token) {
        console.error('Token not provided in callback');
        setError('Authentication token missing. Please try again.');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Calling handleExternalLoginCallback with token');
        await handleExternalLoginCallback(token);
        console.log('External login callback successful, redirecting to home');
        router.replace('/(tabs)');
      } catch (err: any) {
        console.error('External login callback failed:', err);

        
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

    
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Callback handling timed out after 15 seconds');
        setError('The request timed out. Please try again later.');
        setIsLoading(false);
      }
    }, 15000); 

    handleCallback();

    
    return () => clearTimeout(timeoutId);
  }, [token, handleExternalLoginCallback, router, isLoading]);

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
