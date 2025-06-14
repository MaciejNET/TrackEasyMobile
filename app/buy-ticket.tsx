import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ScrollView, Alert, ActivityIndicator } from 'react-native';
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
  SelectDragIndicator,
  SelectScrollView
} from '@/components/ui/select';
import { Ionicons } from '@expo/vector-icons';
import { useColorMode } from '@/hooks/useColorMode';
import { useUser } from '@/hooks/useUser';
import ticketPurchaseApi from '@/services/ticketPurchase';
import { 
  buyTicketCommandSchema, 
  BuyTicketCommand,
  TicketConnectionDto,
  PersonDto
} from '@/schemas/ticket-purchase';


type BuyTicketFormData = {
  email: string;
  passengers: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    discountId: string | null | undefined;
  }[];
  discountCode: string;
  paymentMethod: 'card' | 'cash';
};

export default function BuyTicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    connections: string;
    startStation: string;
    endStation: string;
    departureTime: string;
    arrivalTime: string;
  }>();

  const { colorMode } = useColorMode();
  const { user } = useUser();
  const isDark = colorMode === 'dark';
  const textColor = isDark ? 'text-white' : 'text-black';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const inputBgColor = isDark ? 'bg-gray-700' : 'bg-white';
  const borderColor = isDark ? 'border-gray-600' : 'border-gray-300';

  
  const connections: TicketConnectionDto[] = params.connections ? 
    JSON.parse(params.connections) : [];

  
  const [discountCodeId, setDiscountCodeId] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [ticketIds, setTicketIds] = useState<string[]>([]);
  const [ticketPrice, setTicketPrice] = useState<number | null>(null);
  const [currency, setCurrency] = useState<'PLN' | 'EUR' | 'USD'>('PLN');

  
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<BuyTicketFormData>({
    resolver: zodResolver(buyTicketCommandSchema.omit({ connections: true, discountCodeId: true }).extend({
      discountCode: z.string().optional(),
      paymentMethod: z.enum(['card', 'cash']),
    })),
    defaultValues: {
      email: user?.email || '',
      passengers: [
        {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          dateOfBirth: '', 
          discountId: null,
        }
      ],
      discountCode: '',
      paymentMethod: 'cash',
    }
  });

  
  const paymentMethod = watch('paymentMethod');
  const discountCode = watch('discountCode');
  const passengers = watch('passengers');

  
  const { data: discounts, isLoading: isLoadingDiscounts } = useQuery({
    queryKey: ['discounts'],
    queryFn: ticketPurchaseApi.getDiscounts,
  });

  
  const validateDiscountCode = async (code: string) => {
    if (!code) {
      setDiscountCodeId(null);
      setDiscountPercentage(null);
      return;
    }

    try {
      const discountCodeData = await ticketPurchaseApi.validateDiscountCode(code);
      setDiscountCodeId(discountCodeData.id);
      setDiscountPercentage(discountCodeData.percentage);
      Alert.alert('Success', `Discount code applied: ${discountCodeData.percentage}% off`);
    } catch (error) {
      console.error('Error validating discount code:', error);
      Alert.alert('Error', 'Invalid discount code');
      setDiscountCodeId(null);
      setDiscountPercentage(null);
    }
  };

  
  const addPassenger = () => {
    setValue('passengers', [
      ...passengers,
      {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        discountId: null,
      }
    ]);
  };

  
  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setValue('passengers', passengers.filter((_, i) => i !== index));
    }
  };

  
  const calculatePriceMutation = useMutation({
    mutationFn: (data: BuyTicketCommand) => ticketPurchaseApi.calculatePrice(data),
    onSuccess: (data) => {
      setTicketPrice(data.price);
      setCurrency(data.currency);
    },
    onError: (error) => {
      console.error('Error calculating price:', error);
      Alert.alert('Error', 'Failed to calculate price');
    }
  });

  
  const buyTicketMutation = useMutation({
    mutationFn: (data: BuyTicketCommand) => ticketPurchaseApi.buyTicket(data),
    onSuccess: (data) => {
      setTicketIds(data);
      if (paymentMethod === 'cash') {
        Alert.alert(
          'Success', 
          'Tickets purchased successfully. Please pay in cash to the conductor.',
          [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
        );
      } else {
        
        router.push({
          pathname: '/payment',
          params: {
            ticketIds: JSON.stringify(data),
            price: ticketPrice?.toFixed(2) || '0.00',
            currency: currency
          }
        });
      }
    },
    onError: (error) => {
      console.error('Error buying ticket:', error);
      Alert.alert('Error', 'Failed to purchase tickets');
    }
  });


  
  const formatToYYYYMMDD = (dateString: string): string => {
    if (!dateString) return '';

    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      
      const parts = dateString.split(/[-\/\.]/);
      if (parts.length === 3) {
        
        const year = parts[2].length === 4 ? parts[2] : `20${parts[2]}`;
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return '';
    }

    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  
  const calculatePrice = () => {
    
    const formattedPassengers = watch('passengers').map(passenger => ({
      ...passenger,
      dateOfBirth: formatToYYYYMMDD(passenger.dateOfBirth)
    }));

    
    const formattedConnections = connections.map(connection => ({
      ...connection,
      connectionDate: formatToYYYYMMDD(connection.connectionDate)
    }));

    const formData = {
      email: watch('email'),
      passengers: formattedPassengers,
      discountCodeId: discountCodeId,
      connections: formattedConnections
    };

    calculatePriceMutation.mutate(formData);
  };

  
  const onSubmit: SubmitHandler<BuyTicketFormData> = (data) => {
    
    const formattedPassengers = data.passengers.map(passenger => ({
      ...passenger,
      dateOfBirth: formatToYYYYMMDD(passenger.dateOfBirth)
    }));

    
    const formattedConnections = connections.map(connection => ({
      ...connection,
      connectionDate: formatToYYYYMMDD(connection.connectionDate)
    }));

    
    const ticketData: BuyTicketCommand = {
      email: data.email,
      passengers: formattedPassengers,
      discountCodeId: discountCodeId,
      connections: formattedConnections
    };

    buyTicketMutation.mutate(ticketData);
  };


  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    try {
      
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateString)) {
        return dateString;
      }

      
      const date = new Date(dateString);

      
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }

      
      return dateString;
    } catch (error) {
      
      return dateString;
    }
  };

  return (
    <ScrollView className={`flex-1 ${bgColor}`}>
      <Box className="p-4">
        <HStack className="justify-between mb-4">
          <Button 
            onPress={() => router.back()} 
            variant="outline" 
            size="sm"
            className={`border ${borderColor}`}
          >
            <Text className={textColor}>← Back</Text>
          </Button>
          <Heading className={textColor}>Buy Ticket</Heading>
          <Box className="w-[50px]" /> {}
        </HStack>

        <Box className={`p-3 mb-4 rounded-lg border ${borderColor} ${inputBgColor}`}>
          <Text className={`font-bold ${textColor}`}>{params.startStation} → {params.endStation}</Text>
          <Text className={textColor}>Departure: {formatDate(params.departureTime)}</Text>
          <Text className={textColor}>Arrival: {formatDate(params.arrivalTime)}</Text>
        </Box>

        <Box className="mb-4">
          <Text className={`font-medium mb-1 ${textColor}`}>Email</Text>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input className={`border ${borderColor} rounded-md ${inputBgColor}`}>
                <InputField
                  placeholder="Enter your email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className={textColor}
                />
              </Input>
            )}
            name="email"
          />
          {errors.email ? (
            <Text className="text-red-500 mt-1">{errors.email.message}</Text>
          ) : null}
        </Box>

        <Box className="mb-4">
          <HStack className="justify-between items-center mb-2">
            <Text className={`font-medium ${textColor}`}>Passengers</Text>
            <Button 
              onPress={addPassenger}
              variant="outline"
              size="sm"
              className={`border ${borderColor}`}
            >
              <Text className={textColor}>Add Passenger</Text>
            </Button>
          </HStack>

          {passengers.map((passenger, index) => (
            <Box key={index} className={`p-3 mb-3 rounded-lg border ${borderColor} ${inputBgColor}`}>
              <HStack className="justify-between mb-2">
                <Text className={`font-bold ${textColor}`}>Passenger {index + 1}</Text>
                {index > 0 ? (
                  <Button 
                    onPress={() => removePassenger(index)}
                    variant="outline"
                    size="xs"
                    className="border border-red-500"
                  >
                    <Text className="text-red-500">Remove</Text>
                  </Button>
                ) : null}
              </HStack>

              <Text className={`mb-1 ${textColor}`}>First Name</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input className={`border ${borderColor} rounded-md ${inputBgColor} mb-2`}>
                    <InputField
                      placeholder="First Name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className={textColor}
                    />
                  </Input>
                )}
                name={`passengers.${index}.firstName`}
              />
              {errors.passengers?.[index]?.firstName ? (
                <Text className="text-red-500 mb-2">{errors.passengers[index]?.firstName?.message}</Text>
              ) : null}

              <Text className={`mb-1 ${textColor}`}>Last Name</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input className={`border ${borderColor} rounded-md ${inputBgColor} mb-2`}>
                    <InputField
                      placeholder="Last Name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className={textColor}
                    />
                  </Input>
                )}
                name={`passengers.${index}.lastName`}
              />
              {errors.passengers?.[index]?.lastName ? (
                <Text className="text-red-500 mb-2">{errors.passengers[index]?.lastName?.message}</Text>
              ) : null}

              <Text className={`mb-1 ${textColor}`}>Date of Birth (YYYY-MM-DD)</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input className={`border ${borderColor} rounded-md ${inputBgColor} mb-2`}>
                    <InputField
                      placeholder="YYYY-MM-DD"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className={textColor}
                    />
                  </Input>
                )}
                name={`passengers.${index}.dateOfBirth`}
              />
              {errors.passengers?.[index]?.dateOfBirth ? (
                <Text className="text-red-500 mb-2">{errors.passengers[index]?.dateOfBirth?.message}</Text>
              ) : null}

              <Text className={`mb-1 ${textColor}`}>Discount</Text>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} selectedValue={value || ''}>
                    <SelectTrigger variant="outline" size="md" className={`bg-white dark:bg-gray-800 border ${borderColor} rounded-md`}>
                      <SelectInput placeholder="Select discount (optional)" />
                      <SelectIcon className="mr-3" as={Ionicons} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectScrollView>
                          <SelectItem label="No discount" value="" />
                          {discounts?.map((discount) => (
                            <SelectItem
                              key={discount.id}
                              label={discount.name}
                              value={discount.id}
                            />
                          ))}
                        </SelectScrollView>
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                )}
                name={`passengers.${index}.discountId`}
              />
            </Box>
          ))}
        </Box>

        <Box className="mb-4">
          <Text className={`font-medium mb-1 ${textColor}`}>Discount Code (Optional)</Text>
          <HStack space="sm">
            <Box className="flex-1">
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input className={`border ${borderColor} rounded-md ${inputBgColor}`}>
                    <InputField
                      placeholder="Enter discount code"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      className={textColor}
                    />
                  </Input>
                )}
                name="discountCode"
              />
            </Box>
            <Button 
              onPress={() => validateDiscountCode(discountCode)}
              variant="outline"
              className={`border ${borderColor}`}
            >
              <Text className={textColor}>Apply</Text>
            </Button>
          </HStack>
          {discountPercentage ? (
            <Text className="text-green-500 mt-1">Discount applied: {discountPercentage}% off</Text>
          ) : null}
        </Box>

        <Box className="mb-4">
          <Button 
            onPress={calculatePrice}
            className="bg-blue-500"
          >
            <Text className="text-white">Calculate Price</Text>
          </Button>

          {ticketPrice !== null ? (
            <Box className={`mt-2 p-3 rounded-lg border ${borderColor} ${inputBgColor}`}>
              <Text className={`font-bold ${textColor}`}>Total Price: {ticketPrice?.toFixed(2) || '0.00'} {currency}</Text>
              {discountPercentage ? (
                <Text className="text-green-500">Includes {discountPercentage}% discount</Text>
              ) : null}
            </Box>
          ) : null}
        </Box>

        <Box className="mb-4">
          <Text className={`font-medium mb-1 ${textColor}`}>Payment Method</Text>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <HStack space="md">
                <Button 
                  onPress={() => onChange('cash')}
                  variant={value === 'cash' ? 'solid' : 'outline'}
                  className={value === 'cash' ? 'bg-blue-500' : `border ${borderColor}`}
                >
                  <Text className={value === 'cash' ? 'text-white' : textColor}>Cash</Text>
                </Button>
                <Button 
                  onPress={() => onChange('card')}
                  variant={value === 'card' ? 'solid' : 'outline'}
                  className={value === 'card' ? 'bg-blue-500' : `border ${borderColor}`}
                >
                  <Text className={value === 'card' ? 'text-white' : textColor}>Card</Text>
                </Button>
              </HStack>
            )}
            name="paymentMethod"
          />
        </Box>

        <Button 
          onPress={handleSubmit(onSubmit)}
          className="bg-green-600 mb-4"
        >
          <Text className="text-white font-bold">Buy Ticket</Text>
        </Button>

      </Box>
    </ScrollView>
  );
}
