import { useUser } from "@/hooks/useUser";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { ScrollView, Alert } from "react-native";
import { Pressable } from "react-native";
import { Lock, Bell } from "lucide-react-native";
import { useColorMode } from "@/hooks/useColorMode";
import { Spinner } from "@/components/ui/spinner";
import { HStack } from "@/components/ui/hstack";
import { Button } from "@/components/ui/button";
import cityApi from "@/services/city";
import ticketApi from "@/services/ticket";
import { TicketCity } from "@/schemas/city";
import notificationService from "@/services/notification";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function TriviaScreen() {
    const user = useUser();
    const { token, isAuthenticated } = useAuth();
    const router = useRouter();
    const { colorMode, colorModeKey } = useColorMode();
    const [isSettingNotifications, setIsSettingNotifications] = useState(false);
    const [notificationsSet, setNotificationsSet] = useState(false);

    const { data: currentTicketId, isLoading: isLoadingTicket } = useQuery({
        queryKey: ['currentTicket'],
        queryFn: async () => {
            if (!token) return null;
            return await ticketApi.getCurrentTicket();
        },
        enabled: !!token && isAuthenticated,
        refetchOnMount: true,
    });

    const setupNotifications = async () => {
        if (!currentTicketId) return;

        setIsSettingNotifications(true);
        try {
            const arrivals = await cityApi.getTicketArrivals(currentTicketId);

            const result = await notificationService.scheduleArrivalNotifications(arrivals);

            if (result.success) {
                setNotificationsSet(true);
                Alert.alert(
                    "Notifications Set",
                    "You will be notified when you arrive at each station."
                );
            } else {
                Alert.alert(
                    "Error",
                    result.message || "Failed to set up notifications. Please try again."
                );
            }
        } catch (error) {
            console.error("Error setting up notifications:", error);
            Alert.alert(
                "Error",
                "Failed to set up notifications. Please try again."
            );
        } finally {
            setIsSettingNotifications(false);
        }
    };

    const { data, isLoading, error } = useQuery<TicketCity[]>({
        queryKey: ["ticket-cities", currentTicketId],
        queryFn: () => cityApi.getTicketCities(currentTicketId as string),
        enabled: !!currentTicketId && currentTicketId !== '00000000-0000-0000-0000-000000000000',
    });

    if (!user) {
        return (
            <Box className="flex-1 p-4" key={colorModeKey}>
                <Center>
                    <VStack space="md">
                        <Heading size="xl">Fun Facts</Heading>
                        <Text>You need to be logged in to see fun facts.</Text>
                    </VStack>
                </Center>
            </Box>
        );
    }

    if (!currentTicketId || currentTicketId === '00000000-0000-0000-0000-000000000000') {
        return (
            <Box className="flex-1 p-4" key={colorModeKey}>
                <Center>
                    <VStack space="md">
                        <Heading size="xl">Fun Facts</Heading>
                        <Text>You don't have a current trip.</Text>
                    </VStack>
                </Center>
            </Box>
        );
    }

    console.log(currentTicketId);
    if (isLoadingTicket || isLoading) {
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
                    <Text className="text-red-500">An error occurred while loading cities.</Text>
                </Center>
            </Box>
        );
    }

    const cities = data.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    return (
        <ScrollView className="flex-1 p-4" key={colorModeKey}>
            <VStack space="md">
                <HStack className="justify-between items-center">
                    <Heading size="xl">Fun Facts</Heading>
                    <Button
                        onPress={setupNotifications}
                        isDisabled={isSettingNotifications || notificationsSet}
                        className={`${colorMode === "dark" ? "bg-blue-600" : "bg-blue-500"} ${notificationsSet ? "opacity-50" : ""}`}
                    >
                        <HStack space="xs" className="items-center">
                            {isSettingNotifications ? (
                                <Spinner size="small" color="white" />
                            ) : (
                                <Bell size={16} color="white" />
                            )}
                            <Text className="color-white" size="sm">
                                {notificationsSet ? "Notifications Set" : "Set Notifications"}
                            </Text>
                        </HStack>
                    </Button>
                </HStack>
                {cities.map((city) => (
                    <Pressable
                        key={city.id}
                        disabled={city.isLocked}
                        onPress={() => router.push(`/fun-facts/${city.id}`)}
                        className={`p-4 rounded-3 mb-2 ${city.isLocked ? 'opacity-50' : 'opacity-100'} ${colorMode === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
                    >
                        <HStack className="flex-row justify-between items-center">
                            <Text size="lg">{city.name}</Text>
                            {city.isLocked ? <Lock size={20} className={colorMode === "dark" ? "text-white" : "text-black"} /> : null}
                        </HStack>
                    </Pressable>
                ))}
            </VStack>
        </ScrollView>
    );
}
