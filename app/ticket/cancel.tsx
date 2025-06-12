import React from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Center } from "@/components/ui/center";
import { Button } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useColorMode } from "@/hooks/useColorMode";
import { useLocalSearchParams, useRouter } from "expo-router";
import ticketApi from "@/services/ticket";

export default function CancelTicketScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const textColor = isDark ? "text-white" : "text-black";
    const bgColor = isDark ? "bg-gray-800" : "bg-white";

    const handleCancelTicket = async () => {
        if (!id) return;

        try {
            await ticketApi.cancelTicket(id);
            // Navigate back to the tickets list
            router.push("/(tabs)");
        } catch (error) {
            console.error("Failed to cancel ticket:", error);
            // Stay on the page if there's an error
        }
    };

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
                <Heading className={`${textColor}`}>Confirm Cancellation</Heading>
                <Box className="w-[50px]" /> {/* Empty box for alignment */}
            </HStack>

            <Center className="flex-1">
                <VStack className="space-y-4 items-center">
                    <Text className={`text-lg text-center ${textColor}`}>
                        Are you sure you want to cancel this ticket?
                    </Text>

                    <HStack className="space-x-4 mt-8">
                        <Button
                            className={isDark ? "bg-gray-700" : "bg-gray-300"}
                            onPress={() => router.back()}
                        >
                            <Text className={textColor}>No</Text>
                        </Button>
                        <Button
                            className={isDark ? "bg-red-700" : "bg-red-600"}
                            onPress={handleCancelTicket}
                        >
                            <Text className="text-white">Yes, Cancel</Text>
                        </Button>
                    </HStack>
                </VStack>
            </Center>
        </Box>
    );
}
