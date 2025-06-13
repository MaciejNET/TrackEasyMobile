import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "react-native";
import { useColorMode } from "@/hooks/useColorMode";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Station } from "@/schemas/ticket";

// Format time only (HH:MM)
const formatTime = (timeString: string | null): string => {
    if (!timeString) return 'N/A';

    try {
        // If it's just a time string (HH:MM:SS)
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
            // Return just HH:MM
            return timeString.substring(0, 5);
        }

        // Try to parse as date
        const date = new Date(timeString);

        // Check if date is valid
        if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Return the original string if we can't parse it
        return timeString;
    } catch (error) {
        // If any error occurs, return the original string
        return timeString;
    }
};

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
    const sortedStations = parsedStations.sort(
      (a, b) => a.sequenceNumber - b.sequenceNumber
    );
    
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
                <Box className="w-[50px]" /> {/* Empty box for alignment */}
            </HStack>

            {parsedStations.length === 0 ? (
                <Center className="flex-1">
                    <Text className={textColor}>No stations found</Text>
                </Center>
            ) : (
                <ScrollView className="flex-1">
                    {sortedStations.map((station, index) => (
                        <Box key={index} className={`p-3 mb-2 rounded-lg ${cardBgColor}`}>
                            <Text className={`font-bold ${textColor}`}>{station.name}</Text>
                            <HStack className="justify-between mt-1">
                                <VStack>
                                    <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        Arrival
                                    </Text>
                                    <Text className={textColor}>
                                        {formatTime(station.arrivalTime)}
                                    </Text>
                                </VStack>
                                <VStack>
                                    <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        Departure
                                    </Text>
                                    <Text className={textColor}>
                                        {formatTime(station.departureTime)}
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
