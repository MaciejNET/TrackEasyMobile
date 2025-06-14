import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Spinner } from '@/components/ui/spinner';
import { ScrollView } from 'react-native';
import { useColorMode } from '@/hooks/useColorMode';
import cityApi from '@/services/city';
import { CityDetails } from '@/schemas/city';

export default function CityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorMode, colorModeKey } = useColorMode();
  const isDark = colorMode === 'dark';
  const textColor = isDark ? 'text-white' : 'text-black';
  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const cardBgColor = isDark ? 'bg-gray-700' : 'bg-gray-100';

  const { data, isLoading, error } = useQuery<CityDetails>({
    queryKey: ['city-details', id],
    queryFn: () => cityApi.getCityDetails(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center" key={colorModeKey}>
        <Spinner size="large" />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box className="flex-1 p-4" key={colorModeKey}>
        <Center>
          <VStack space="md">
            <Heading size="xl">Error</Heading>
            <Text className="text-red-500">An error occurred while loading city details.</Text>
            <Button onPress={() => router.back()} className="mt-4">
              <Text className="text-white">Go Back</Text>
            </Button>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <ScrollView className="flex-1 p-4" key={colorModeKey}>
      <HStack className="justify-between items-center mb-4">
        <Button
          variant="link"
          onPress={() => router.back()}
          className={textColor}
        >
          <Text className={textColor}>← Back</Text>
        </Button>
        <Heading className={textColor}>{data.name}</Heading>
        <Box className="w-[50px]" /> {}
      </HStack>

      <Box className={`p-4 rounded-lg mb-4 ${cardBgColor}`}>
        <Text className={`font-bold mb-2 ${textColor}`}>Country</Text>
        <Text className={textColor}>{data.country.name}</Text>
      </Box>

      <Box className={`p-4 rounded-lg ${cardBgColor}`}>
        <Text className={`font-bold mb-2 ${textColor}`}>Fun Facts</Text>
        {data.funFacts.length > 0 ? (
          data.funFacts.map((fact, index) => (
            <Box key={index} className="mb-2 pb-2 border-b border-gray-600 last:border-0">
              <Text className={textColor}>• {fact}</Text>
            </Box>
          ))
        ) : (
          <Text className={textColor}>No fun facts available for this city.</Text>
        )}
      </Box>
    </ScrollView>
  );
}
