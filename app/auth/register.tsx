import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollView } from 'react-native';
import { useColorMode } from '@/hooks/useColorMode';
import { registerSchema, RegisterFormData } from '@/schemas/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colorMode } = useColorMode();

  // Define theme-based styles
  const isDark = colorMode === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const buttonBgColor = isDark ? "bg-white" : "bg-black";
  const buttonTextColor = isDark ? "text-black" : "text-white";
  const inputBorderColor = isDark ? "border-white" : "border-gray-300";
  const inputBgColor = isDark ? "bg-transparent" : "bg-white";

  const { control, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate data with Zod schema
      const validationResult = registerSchema.safeParse(data);

      if (!validationResult.success) {
        // Get the first error message
        const errorMessage = validationResult.error.errors[0]?.message || 'Validation failed';
        setError(errorMessage);
        return;
      }

      // Format date as YYYY-MM-DD
      const dateOfBirth = formatDateString(data.dateOfBirth);

      await register(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        dateOfBirth
      );

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format date string to YYYY-MM-DD
  const formatDateString = (dateString: string): string => {
    // Simple validation for MM/DD/YYYY format
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;

    if (dateRegex.test(dateString)) {
      const [month, day, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }

    return dateString; // Return as is if not in expected format
  };

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ backgroundColor: isDark ? 'black' : 'white' }}>
      <Box className={`flex-1 p-6 justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
        <Box className="mb-6">
          <Text className={`text-3xl font-bold text-center mb-2 ${textColor}`}>Create Account</Text>
          <Text className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Sign up to get started</Text>
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

        <Box className="mb-4">
          <Text className={`font-medium mb-1 ${textColor}`}>Email</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input className={`border ${inputBorderColor} rounded-md ${!!errors.email ? 'border-red-500' : ''}`}>
                <InputField
                  placeholder="Enter your email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className={`${textColor} ${inputBgColor}`}
                  placeholderTextColor={isDark ? "#aaa" : "#777"}
                />
              </Input>
            )}
            name="email"
          />
          {errors.email ? (
            <Text className={isDark ? 'text-red-400' : 'text-red-500 mt-1 text-sm'}>{errors.email.message}</Text>
          ) : null}
        </Box>

        <Box className="mb-4">
          <Text className={`font-medium mb-1 ${textColor}`}>Date of Birth (MM/DD/YYYY)</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input className={`border ${inputBorderColor} rounded-md ${!!errors.dateOfBirth ? 'border-red-500' : ''}`}>
                <InputField
                  placeholder="MM/DD/YYYY"
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
          ) : null}
        </Box>

        <Box className="mb-4">
          <Text className={`font-medium mb-1 ${textColor}`}>Password</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input className={`border ${inputBorderColor} rounded-md ${!!errors.password ? 'border-red-500' : ''}`}>
                <InputField
                  placeholder="Create a password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                  className={`${textColor} ${inputBgColor}`}
                  placeholderTextColor={isDark ? "#aaa" : "#777"}
                />
              </Input>
            )}
            name="password"
          />
          {errors.password ? (
            <Text className={isDark ? 'text-red-400' : 'text-red-500 mt-1 text-sm'}>{errors.password.message}</Text>
          ) : null}
        </Box>

        <Box className="mb-6">
          <Text className={`font-medium mb-1 ${textColor}`}>Confirm Password</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input className={`border ${inputBorderColor} rounded-md ${!!errors.confirmPassword ? 'border-red-500' : ''}`}>
                <InputField
                  placeholder="Confirm your password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                  className={`${textColor} ${inputBgColor}`}
                  placeholderTextColor={isDark ? "#aaa" : "#777"}
                />
              </Input>
            )}
            name="confirmPassword"
          />
          {errors.confirmPassword ? (
            <Text className={isDark ? 'text-red-400' : 'text-red-500 mt-1 text-sm'}>{errors.confirmPassword.message}</Text>
          ) : null}
        </Box>

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`mb-4 ${buttonBgColor} border ${inputBorderColor}`}
        >
          {isSubmitting ? (
            <Spinner color={isDark ? "black" : "white"} size="small" />
          ) : (
            <Text className={`font-medium ${buttonTextColor}`}>Create Account</Text>
          )}
        </Button>

        <Box className="flex-row justify-center">
          <Text className={isDark ? 'text-gray-300' : 'text-gray-500'}>Already have an account? </Text>
          <Text className={`${isDark ? 'text-blue-400' : 'text-blue-500'} font-medium`} onPress={navigateToLogin}>
            Sign In
          </Text>
        </Box>
      </Box>
    </ScrollView>
  );
}
