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
import { Alert } from '@/components/ui/alert';
import { useColorMode } from '@/hooks/useColorMode';
import { loginSchema, LoginFormData } from '@/schemas/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colorMode } = useColorMode();

  
  const isDark = colorMode === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const buttonBgColor = isDark ? "bg-white" : "bg-black";
  const buttonTextColor = isDark ? "text-black" : "text-white";
  const inputBorderColor = isDark ? "border-white" : "border-gray-300";
  const inputBgColor = isDark ? "bg-transparent" : "bg-white";

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      
      const validationResult = loginSchema.safeParse(data);

      if (!validationResult.success) {
        
        const errorMessage = validationResult.error.errors[0]?.message || 'Validation failed';
        setError(errorMessage);
        return;
      }

      
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <Box className={`flex-1 p-6 justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
      <Box className="mb-8">
        <Text className={`text-3xl font-bold text-center mb-2 ${textColor}`}>Welcome Back</Text>
        <Text className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Sign in to your account</Text>
      </Box>

      {error ? (
        <Box className={`mb-4 p-3 ${isDark ? 'bg-red-900' : 'bg-red-100'} rounded-md`}>
          <Text className={isDark ? 'text-white' : 'text-red-700'}>{error}</Text>
        </Box>
      ) : null}

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

      <Box className="mb-6">
        <Text className={`font-medium mb-1 ${textColor}`}>Password</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input className={`border ${inputBorderColor} rounded-md ${!!errors.password ? 'border-red-500' : ''}`}>
              <InputField
                placeholder="Enter your password"
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

      <Button
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className={`mb-4 ${buttonBgColor} border ${inputBorderColor}`}
      >
        {isSubmitting ? (
          <Spinner color={isDark ? "black" : "white"} size="small" />
        ) : (
          <Text className={`font-medium ${buttonTextColor}`}>Sign In</Text>
        )}
      </Button>

      <Box className="mb-6">
        <Text className={`text-center mb-4 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Or sign in with</Text>
        <Box className="flex-row justify-center space-x-4">
          <Button
            onPress={() => router.push('/auth/external-login?provider=google')}
            className={`flex-1 ${isDark ? 'bg-red-600' : 'bg-red-500'}`}
          >
            <Text className="text-white font-medium">Google</Text>
          </Button>
          <Button
            onPress={() => router.push('/auth/external-login?provider=microsoft')}
            className={`flex-1 ${isDark ? 'bg-blue-700' : 'bg-blue-600'}`}
          >
            <Text className="text-white font-medium">Microsoft</Text>
          </Button>
        </Box>
      </Box>

      <Box className="flex-row justify-center">
        <Text className={isDark ? 'text-gray-300' : 'text-gray-500'}>Don't have an account? </Text>
        <Text className={`${isDark ? 'text-blue-400' : 'text-blue-500'} font-medium`} onPress={navigateToRegister}>
          Sign Up
        </Text>
      </Box>
    </Box>
  );
}
