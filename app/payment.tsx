import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { 
  Select, 
  SelectItem, 
  SelectTrigger, 
  SelectInput, 
  SelectIcon, 
  SelectPortal, 
  SelectBackdrop, 
  SelectContent, 
  SelectDragIndicatorWrapper, 
  SelectDragIndicator
} from '@/components/ui/select';
import { Ionicons } from '@expo/vector-icons';
import { useColorMode } from '@/hooks/useColorMode';
import ticketPurchaseApi from '@/services/ticketPurchase';
import { 
  payTicketByCardCommandSchema,
  PayTicketByCardCommand
} from '@/schemas/ticket-purchase';


type PaymentFormData = {
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvc: string;
  currency: 'PLN' | 'EUR' | 'USD';
};

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ticketIds: string;
    price: string;
    currency: string;
  }>();

  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const textColor = isDark ? 'text-white' : 'text-black';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const inputBgColor = isDark ? 'bg-gray-700' : 'bg-white';
  const borderColor = isDark ? 'border-gray-600' : 'border-gray-300';

  
  const ticketIds: string[] = params.ticketIds ? JSON.parse(params.ticketIds) : [];
  const price = params.price ? parseFloat(params.price) : 0;
  const initialCurrency = (params.currency as 'PLN' | 'EUR' | 'USD') || 'PLN';

  
  const { control, handleSubmit, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(z.object({
      cardNumber: z.string().regex(/^\d{16}$/, { message: 'Card number must be 16 digits' }),
      cardExpMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, { message: 'Month must be between 01-12' }),
      cardExpYear: z.string().regex(/^\d{2}$/, { message: 'Year must be 2 digits' }),
      cardCvc: z.string().regex(/^\d{3,4}$/, { message: 'CVC must be 3 or 4 digits' }),
      currency: z.enum(['PLN', 'EUR', 'USD']),
    })),
    defaultValues: {
      cardNumber: '',
      cardExpMonth: '',
      cardExpYear: '',
      cardCvc: '',
      currency: initialCurrency,
    }
  });

  
  const payWithCardMutation = useMutation({
    mutationFn: (data: PayTicketByCardCommand) => ticketPurchaseApi.payWithCard(data),
    onSuccess: () => {
      Alert.alert(
        'Success', 
        'Payment processed successfully',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    },
    onError: (error) => {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment');
    }
  });

  
  const onSubmit = (data: PaymentFormData) => {
    if (ticketIds.length === 0) {
      Alert.alert('Error', 'No tickets to pay for');
      return;
    }

    const paymentData: PayTicketByCardCommand = {
      ticketIds: ticketIds,
      currency: data.currency,
      cardNumber: data.cardNumber,
      cardExpMonth: parseInt(data.cardExpMonth),
      cardExpYear: parseInt(data.cardExpYear),
      cardCvc: data.cardCvc
    };

    payWithCardMutation.mutate(paymentData);
  };

  return (
    <Box className={`flex-1 p-4 ${bgColor}`}>
      <HStack className="justify-between mb-4">
        <Button 
          onPress={() => router.back()} 
          variant="outline" 
          size="sm"
          className={`border ${borderColor}`}
        >
          <Text className={textColor}>← Back</Text>
        </Button>
        <Heading className={textColor}>Payment</Heading>
        <Box className="w-[50px]" /> {}
      </HStack>

      <VStack space="md" className="mb-4">
        <Box className={`p-3 rounded-lg border ${borderColor} ${inputBgColor}`}>
          <Text className={`font-bold ${textColor}`}>Total Amount</Text>
          <Text className={`text-xl ${textColor}`}>{price} {initialCurrency}</Text>
        </Box>

        <Text className={`font-medium ${textColor}`}>Card Number</Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input className={`border ${borderColor} rounded-md ${inputBgColor}`}>
              <InputField
                placeholder="1234567890123456"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="numeric"
                maxLength={16}
                className={textColor}
              />
            </Input>
          )}
          name="cardNumber"
        />
        {errors.cardNumber ? (
          <Text className="text-red-500">{errors.cardNumber.message}</Text>
        ) : null}

        <HStack space="sm">
          <Box className="flex-1">
            <Text className={`font-medium ${textColor}`}>Exp. Month (MM)</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input className={`border ${borderColor} rounded-md ${inputBgColor}`}>
                  <InputField
                    placeholder="MM"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="numeric"
                    maxLength={2}
                    className={textColor}
                  />
                </Input>
              )}
              name="cardExpMonth"
            />
            {errors.cardExpMonth ? (
              <Text className="text-red-500">{errors.cardExpMonth.message}</Text>
            ) : null}
          </Box>
          <Box className="flex-1">
            <Text className={`font-medium ${textColor}`}>Exp. Year (YY)</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input className={`border ${borderColor} rounded-md ${inputBgColor}`}>
                  <InputField
                    placeholder="YY"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="numeric"
                    maxLength={2}
                    className={textColor}
                  />
                </Input>
              )}
              name="cardExpYear"
            />
            {errors.cardExpYear ? (
              <Text className="text-red-500">{errors.cardExpYear.message}</Text>
            ) : null}
          </Box>
          <Box className="flex-1">
            <Text className={`font-medium ${textColor}`}>CVC</Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input className={`border ${borderColor} rounded-md ${inputBgColor}`}>
                  <InputField
                    placeholder="CVC"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="numeric"
                    maxLength={4}
                    className={textColor}
                  />
                </Input>
              )}
              name="cardCvc"
            />
            {errors.cardCvc ? (
              <Text className="text-red-500">{errors.cardCvc.message}</Text>
            ) : null}
          </Box>
        </HStack>

        <Text className={`font-medium ${textColor}`}>Currency</Text>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <Select onValueChange={onChange} selectedValue={value}>
              <SelectTrigger variant="outline" size="md" className={`bg-white dark:bg-gray-800 border ${borderColor} rounded-md`}>
                <SelectInput placeholder="Select currency" />
                <SelectIcon className="mr-3" as={Ionicons} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="PLN" value="PLN" />
                  <SelectItem label="EUR" value="EUR" />
                  <SelectItem label="USD" value="USD" />
                </SelectContent>
              </SelectPortal>
            </Select>
          )}
          name="currency"
        />

        <Button 
          onPress={handleSubmit(onSubmit)}
          className="bg-blue-500 mt-4"
        >
          <Text className="text-white font-bold">Process Payment</Text>
        </Button>
      </VStack>
    </Box>
  );
}
