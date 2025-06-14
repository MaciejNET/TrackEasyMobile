import React, { useState } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Center } from "@/components/ui/center";
import { Pressable } from "@/components/ui/pressable";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HStack } from "@/components/ui/hstack";
import { FlatList } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import ticketApi from "@/services/ticket";
import { useColorMode } from "@/hooks/useColorMode";
import { Ticket } from "@/schemas/ticket";
import { useRouter } from "expo-router";


const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';

    try {
        
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
            
            return timeString.substring(0, 5);
        }

        
        const date = new Date(timeString);

        
        if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        
        return timeString;
    } catch (error) {
        
        return timeString;
    }
};


const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';

    try {
        
        const date = new Date(dateString);

        
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString();
        }

        
        return dateString;
    } catch (error) {
        
        return dateString;
    }
};

const PAGE_SIZE = 10;

export default function TicketsScreen() {
    const { user, isLoading: userLoading } = useAuth();
    const { colorMode, colorModeKey } = useColorMode();
    const isDark = colorMode === "dark";
    const textColor = isDark ? "text-white" : "text-black";
    const bgColor = isDark ? "bg-gray-800" : "bg-white";
    const cardBgColor = isDark ? "bg-gray-700" : "bg-gray-100";
    const borderColor = isDark ? "border-gray-600" : "border-gray-300";

    const [tab, setTab] = useState<"current" | "archive">("current");
    const [pageNumber, setPageNumber] = useState(0);
    const router = useRouter();

    
    const {
        data: ticketsData,
        isLoading: ticketsLoading,
        refetch: refetchTickets,
    } = useQuery({
        queryKey: ["tickets", user?.id, tab, pageNumber],
        queryFn: () => 
            ticketApi.getUserTickets(user!.id, tab === "current" ? 0 : 1, pageNumber, PAGE_SIZE),
        enabled: !!user?.id,
    });

    const handleTicketPress = (ticket: Ticket) => {
        
        router.push({
            pathname: "/ticket/[id]",
            params: { id: ticket.id, tab }
        });
    };

    if (userLoading) {
        return (
            <Center className="flex-1" key={colorModeKey}>
                <Spinner size="large" />
            </Center>
        );
    }

    if (!user) {
        return (
            <Center className={`flex-1 ${bgColor}`} key={colorModeKey}>
                <Text className={`text-lg ${textColor}`}>You must be logged in to view your tickets.</Text>
            </Center>
        );
    }

    return (
        <Box className={`flex-1 p-4 ${bgColor}`} key={colorModeKey}>
            <Heading className={`mb-4 ${textColor}`}>Your Tickets</Heading>

            <HStack className="mb-4 space-x-6">
                <Pressable 
                    onPress={() => { 
                        setTab("current"); 
                        setPageNumber(0); 
                        refetchTickets(); 
                    }}
                >
                    <Text 
                        className={`${textColor} ${tab === "current" ? "font-bold border-b-2 border-blue-500" : ""}`}
                    >
                        Current
                    </Text>
                </Pressable>
                <Pressable 
                    onPress={() => { 
                        setTab("archive"); 
                        setPageNumber(0); 
                        refetchTickets(); 
                    }}
                >
                    <Text 
                        className={`${textColor} ${tab === "archive" ? "font-bold border-b-2 border-blue-500" : ""}`}
                    >
                        Archive
                    </Text>
                </Pressable>
            </HStack>

            {ticketsLoading ? (
                <Center className="flex-1" key={colorModeKey}>
                    <Spinner size="large" />
                </Center>
            ) : ticketsData?.items.length === 0 ? (
                <Center className="flex-1" key={colorModeKey}>
                    <Text className={textColor}>No tickets found</Text>
                </Center>
            ) : (
                <FlatList
                    key={colorModeKey}
                    data={ticketsData?.items || []}
                    keyExtractor={(item: unknown, index: number) => (item as Ticket).id}
                    renderItem={({ item }: { item: unknown }) => {
                        const ticket = item as Ticket;
                        return (
                        <Pressable onPress={() => handleTicketPress(ticket)}>
                            <Box 
                                className={`p-4 mb-3 rounded-lg ${cardBgColor} border ${borderColor}`}
                            >
                                <HStack className="justify-between mb-2">
                                    <Text className={`font-bold ${textColor}`}>
                                        {ticket.startStation} → {ticket.endStation}
                                    </Text>
                                </HStack>
                                <HStack className="justify-between">
                                    <VStack>
                                        <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                            Departure
                                        </Text>
                                        <Text className={textColor}>
                                            {formatTime(ticket.departureTime)}
                                        </Text>
                                    </VStack>
                                    <VStack>
                                        <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                            Arrival
                                        </Text>
                                        <Text className={textColor}>
                                            {formatTime(ticket.arrivalTime)}
                                        </Text>
                                    </VStack>
                                </HStack>
                                <Text className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                    Date: {formatDate(ticket.connectionDate)}
                                </Text>
                            </Box>
                        </Pressable>
                        );
                    }}
                    ListFooterComponent={() => (
                        ticketsData && ticketsData.pageNumber < ticketsData.totalPages - 1 ? (
                            <Button 
                                className={`mt-4 ${isDark ? "bg-blue-600" : "bg-blue-500"}`}
                                onPress={() => setPageNumber(prev => prev + 1)}
                            >
                                <Text className="text-white">Load more</Text>
                            </Button>
                        ) : null
                    )}
                />
            )}

        </Box>
    );
}
