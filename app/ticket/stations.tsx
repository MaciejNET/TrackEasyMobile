import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
    HStack,
    ScrollView,
} from "@gluestack-ui/themed";
import { useColorMode } from "@/hooks/useColorMode";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Station } from "@/schemas/ticket";

export default function StationsScreen() {
    const params = useLocalSearchParams<{ stations: string }>();
    const stationsParam = params.stations;
    const router = useRouter();
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const textColor = isDark ? "text-white" : "text-black";
    const bgColor = isDark ? "bg-gray-800" : "bg-white";
    const cardBgColor = isDark ? "bg-gray-700" : "bg-gray-100";

    // Parse the stations from the URL parameter
    const parsedStations: Station[] = stationsParam ? JSON.parse(stationsParam) : [];

    return (
        <Box className={`flex-1 p-4 ${bgColor}`}>
            <HStack className="justify-between items-center mb-4">
                <Button
                    variant="link"
                    onPress={() => router.back()}
                    className={`${textColor}`}
                >
                    <Text className={`${textColor}`}>← Back</Text>
                </Button>
                <Heading className={`${textColor}`}>All Stations</Heading>
                <Box width={50} /> {/* Empty box for alignment */}
            </HStack>

            {parsedStations.length === 0 ? (
                <Center flex={1}>
                    <Text className={textColor}>No stations found</Text>
                </Center>
            ) : (
                <ScrollView className="flex-1">
                    {parsedStations.map((station, index) => (
                        <Box key={index} className={`p-3 mb-2 rounded-lg ${cardBgColor}`}>
                            <Text className={`font-bold ${textColor}`}>{station.name}</Text>
                            <HStack className="justify-between mt-1">
                                <VStack>
                                    <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        Arrival
                                    </Text>
                                    <Text className={textColor}>
                                        {station.arrivalTime || 'N/A'}
                                    </Text>
                                </VStack>
                                <VStack>
                                    <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        Departure
                                    </Text>
                                    <Text className={textColor}>
                                        {station.departureTime || 'N/A'}
                                    </Text>
                                </VStack>
                            </HStack>
                        </Box>
                    ))}
                </ScrollView>
            )}
        </Box>
    );
}
