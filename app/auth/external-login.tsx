import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useColorMode } from '@/hooks/useColorMode';
import { externalLoginSchema, ExternalLoginData } from '@/schemas/auth';
import WebViewAuth from './WebViewAuth';
import authApi from '@/services/auth';

export default function ExternalLoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ provider: string }>();
  const provider = params.provider as 'google' | 'microsoft';
  const { externalLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const { colorMode } = useColorMode();

  // Define theme-based styles
  const isDark = colorMode === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const buttonBgColor = isDark ? "bg-white" : "bg-black";
  const buttonTextColor = isDark ? "text-black" : "text-white";
  const inputBorderColor = isDark ? "border-white" : "border-gray-300";
  const inputBgColor = isDark ? "bg-transparent" : "bg-white";

  const { control, handleSubmit, formState: { errors } } = useForm<ExternalLoginData>({
    resolver: zodResolver(externalLoginSchema),
    defaultValues: {
      provider,
      firstName: '',
      lastName: '',
      dateOfBirth: '',
    },
  });

  const onSubmit = async (data: ExternalLoginData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Submitting external login form with data:', JSON.stringify(data));

      // Format date to YYYY-MM-DD
      let formattedDate = formatDateString(data.dateOfBirth);
      console.log('Formatted date:', formattedDate);

      // Additional validation for date format
      if (!formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.error('Date is not in YYYY-MM-DD format after formatting:', formattedDate);

        // Try to parse as a Date object as a fallback
        try {
          const date = new Date(formattedDate);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
            console.log('Reformatted date using Date object:', formattedDate);
          } else {
            throw new Error('Invalid date format. Please use MM/DD/YYYY format.');
          }
        } catch (dateError) {
          console.error('Error parsing date:', dateError);
          throw new Error('Invalid date format. Please use MM/DD/YYYY format.');
        }
      }

      // Call authApi.externalLogin directly to get the URL
      const url = await authApi.externalLogin({
        provider: data.provider,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: formattedDate
      });

      console.log('Received authentication URL:', url);

      // Set the URL in state to trigger rendering the WebView
      setAuthUrl(url);
    } catch (err: any) {
      console.error('Error in external login submission:', err);

      // Provide more user-friendly error messages based on the error
      if (err.message.includes('Date must be in YYYY-MM-DD format')) {
        setError('Please enter the date in MM/DD/YYYY format.');
      } else if (err.message.includes('Invalid date format')) {
        setError('Please enter a valid date in MM/DD/YYYY format.');
      } else if (err.message.includes('500')) {
        setError('The server encountered an error. Please try again later.');
      } else if (err.message.includes('timeout')) {
        setError('The request timed out. Please check your internet connection and try again.');
      } else if (err.message.includes('Network Error')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'External login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format date string to YYYY-MM-DD
  const formatDateString = (dateString: string): string => {
    console.log('Formatting date string:', dateString);

    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      console.log('Date is already in YYYY-MM-DD format');
      return dateString;
    }

    // Try MM/DD/YYYY format (with or without leading zeros)
    const mmddyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (mmddyyyyRegex.test(dateString)) {
      const match = dateString.match(mmddyyyyRegex);
      if (match) {
        const [_, month, day, year] = match;
        // Ensure month and day are valid
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);

        if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
          const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          console.log('Formatted from MM/DD/YYYY to YYYY-MM-DD:', formattedDate);
          return formattedDate;
        } else {
          console.warn('Invalid month or day in MM/DD/YYYY format:', dateString);
        }
      }
    }

    // Try DD/MM/YYYY format (with or without leading zeros)
    const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (ddmmyyyyRegex.test(dateString)) {
      const match = dateString.match(ddmmyyyyRegex);
      if (match) {
        const [_, day, month, year] = match;
        // Ensure month and day are valid
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);

        if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
          const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          console.log('Formatted from DD/MM/YYYY to YYYY-MM-DD:', formattedDate);
          return formattedDate;
        } else {
          console.warn('Invalid month or day in DD/MM/YYYY format:', dateString);
        }
      }
    }

    // Try MM-DD-YYYY format
    const mmddyyyyDashRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    if (mmddyyyyDashRegex.test(dateString)) {
      const match = dateString.match(mmddyyyyDashRegex);
      if (match) {
        const [_, month, day, year] = match;
        // Ensure month and day are valid
        const monthNum = parseInt(month, 10);
        const dayNum = parseInt(day, 10);

        if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
          const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          console.log('Formatted from MM-DD-YYYY to YYYY-MM-DD:', formattedDate);
          return formattedDate;
        } else {
          console.warn('Invalid month or day in MM-DD-YYYY format:', dateString);
        }
      }
    }

    // Try YYYY-MM-DD format with different separators
    const yyyymmddRegex = /^(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})$/;
    if (yyyymmddRegex.test(dateString)) {
      const match = dateString.match(yyyymmddRegex);
      if (match) {
        const [_, year, month, day] = match;
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        console.log('Formatted from YYYY/MM/DD or similar to YYYY-MM-DD:', formattedDate);
        return formattedDate;
      }
    }

    // Try to parse as a Date object
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        console.log('Formatted from Date object to YYYY-MM-DD:', formattedDate);
        return formattedDate;
      }
    } catch (error) {
      console.error('Error parsing date as Date object:', error);
    }

    // If all else fails, return the original string
    console.warn('Could not format date, returning original:', dateString);
    return dateString;
  };

  const providerName = provider === 'google' ? 'Google' : 'Microsoft';
  const providerColor = provider === 'google' ? 
    (isDark ? 'bg-red-600' : 'bg-red-500') : 
    (isDark ? 'bg-blue-700' : 'bg-blue-600');

  // Handle canceling the WebView authentication
  const handleCancel = () => {
    setAuthUrl(null);
    setError(null);
  };

  // If we have an auth URL, show the WebView
  if (authUrl) {
    return (
      <WebViewAuth
        url={authUrl}
        provider={provider}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <Box className={`flex-1 p-6 justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
      <Box className="mb-8">
        <Text className={`text-3xl font-bold text-center mb-2 ${textColor}`}>Sign in with {providerName}</Text>
        <Text className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
          Please provide the following information to continue
        </Text>
      </Box>

      {error ? (
        <Box className={`mb-4 p-3 ${isDark ? 'bg-red-900' : 'bg-red-100'} rounded-md`}>
          <Text className={isDark ? 'text-white' : 'text-red-700'}>{error}</Text>
        </Box>
      ) : null}

      <Box className="mb-4">
        <Text className={`font-medium mb-1 ${textColor}`}>First Name</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input className={`border ${inputBorderColor} rounded-md ${!!errors.firstName ? 'border-red-500' : ''}`}>
              <InputField
                placeholder="Enter your first name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className={`${textColor} ${inputBgColor}`}
                placeholderTextColor={isDark ? "#aaa" : "#777"}
              />
            </Input>
          )}
          name="firstName"
        />
        {errors.firstName ? (
          <Text className={isDark ? 'text-red-400' : 'text-red-500 mt-1 text-sm'}>{errors.firstName.message}</Text>
        ) : null}
      </Box>

      <Box className="mb-4">
        <Text className={`font-medium mb-1 ${textColor}`}>Last Name</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input className={`border ${inputBorderColor} rounded-md ${!!errors.lastName ? 'border-red-500' : ''}`}>
              <InputField
                placeholder="Enter your last name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className={`${textColor} ${inputBgColor}`}
                placeholderTextColor={isDark ? "#aaa" : "#777"}
              />
            </Input>
          )}
          name="lastName"
        />
        {errors.lastName ? (
          <Text className={isDark ? 'text-red-400' : 'text-red-500 mt-1 text-sm'}>{errors.lastName.message}</Text>
        ) : null}
      </Box>

      <Box className="mb-6">
        <Text className={`font-medium mb-1 ${textColor}`}>Date of Birth (YYYY-MM-DD)</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input className={`border ${inputBorderColor} rounded-md ${!!errors.dateOfBirth ? 'border-red-500' : ''}`}>
              <InputField
                placeholder="YYYY-MM-DD"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className={`${textColor} ${inputBgColor}`}
                placeholderTextColor={isDark ? "#aaa" : "#777"}
              />
            </Input>
          )}
          name="dateOfBirth"
        />
        {errors.dateOfBirth ? (
          <Text className={isDark ? 'text-red-400' : 'text-red-500 mt-1 text-sm'}>{errors.dateOfBirth.message}</Text>
        ) : (
          <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Format: YYYY-MM-DD (e.g., 2000-01-31). Other formats like MM/DD/YYYY will be converted automatically.
          </Text>
        )}
      </Box>

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className={`mb-4 ${providerColor}`}
      >
        {isSubmitting ? (
          <Spinner color="white" size="small" />
        ) : (
          <Text className="text-white font-medium">Continue with {providerName}</Text>
        )}
      </Button>

      <Box className="flex-row justify-center">
        <Text className={isDark ? 'text-gray-300' : 'text-gray-500'}>Changed your mind? </Text>
        <Text className={`${isDark ? 'text-blue-400' : 'text-blue-500'} font-medium`} onPress={() => router.back()}>
          Go Back
        </Text>
      </Box>
    </Box>
  );
}
