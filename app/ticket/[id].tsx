import React, { useState, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HStack } from "@/components/ui/hstack";
import { InputField } from "@/components/ui/input";
import { Image, ScrollView, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import ticketApi from "@/services/ticket";
import { useColorMode } from "@/hooks/useColorMode";
import { TicketDetails, QrCode, RefundRequest } from "@/schemas/ticket";
import { useLocalSearchParams, useRouter } from "expo-router";


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


const safeParseDate = (dateString: string): Date | null => {
    try {
        const date = new Date(dateString);
        return !isNaN(date.getTime()) ? date : null;
    } catch (error) {
        return null;
    }
};

export default function TicketDetailsScreen() {
    const { id, tab } = useLocalSearchParams<{ id: string, tab?: string }>();
    
    const isCurrentTab = tab === "current";
    const router = useRouter();
    const { user, token, isAuthenticated } = useAuth();
    const { colorMode, colorModeKey } = useColorMode();
    const isDark = colorMode === "dark";
    const textColor = isDark ? "text-white" : "text-black";
    const bgColor = isDark ? "bg-gray-800" : "bg-white";
    const cardBgColor = isDark ? "bg-gray-700" : "bg-gray-100";
    const borderColor = isDark ? "border-gray-600" : "border-gray-300";

    const [refundReason, setRefundReason] = useState("");
    const [showRefundForm, setShowRefundForm] = useState(false);

    
    const { data: currentTicketId, isLoading: isLoadingCurrentTicket } = useQuery({
        queryKey: ['currentTicket'],
        queryFn: async () => {
            if (!token) return null;
            return await ticketApi.getCurrentTicket();
        },
        enabled: !!token && isAuthenticated,
        refetchOnMount: true, 
    });

    
    const {
        data: ticketDetails,
        isLoading: detailsLoading,
        refetch: refetchDetails,
    } = useQuery({
        queryKey: ["ticketDetails", id],
        queryFn: () => ticketApi.getTicketDetails(id),
        enabled: !!id,
    });

    const {
        data: qrCode,
        isLoading: qrLoading,
        refetch: refetchQr,
    } = useQuery({
        queryKey: ["qrCode", ticketDetails?.qrCodeId],
        queryFn: () => {
            if (!ticketDetails?.qrCodeId) {
                throw new Error("QR code ID is missing");
            }
            return ticketApi.getQrCode(ticketDetails.qrCodeId);
        },
        enabled: !!ticketDetails?.qrCodeId,
    });


    const handleRefundRequest = async () => {
        if (!ticketDetails || !user) return;

        
        if (ticketDetails.status !== "PAID") {
            console.error("Cannot request refund for non-PAID tickets");
            alert("Refund is only available for PAID tickets");
            setShowRefundForm(false);
            return;
        }

        try {
            const refundData: RefundRequest = {
                userId: user.id,
                ticketId: ticketDetails.id,
                reason: refundReason.trim() || "No reason provided",
                email: user.email
            };

            await ticketApi.requestRefund(refundData, ticketDetails.status);
            setShowRefundForm(false);
            setRefundReason("");
            refetchDetails();
        } catch (error) {
            console.error("Failed to request refund:", error);
            alert("Failed to request refund. Please try again later.");
        }
    };

    
    const isJourneyStarted = (ticket: TicketDetails): boolean => {
        if (!ticket) return false;

        const now = new Date();
        const departureTime = safeParseDate(ticket.departureTime);

        
        if (!departureTime) return false;

        return now > departureTime;
    };

    if (detailsLoading || isLoadingCurrentTicket) {
        return (
            <Center className="flex-1" key={colorModeKey}>
                <Spinner size="large" />
            </Center>
        );
    }

    if (!ticketDetails) {
        return (
            <Center className={`flex-1 ${bgColor}`} key={colorModeKey}>
                <Text className={`text-lg ${textColor}`}>Ticket not found</Text>
                <Button 
                    className={`mt-4 ${isDark ? "bg-blue-700" : "bg-blue-600"}`}
                    onPress={() => router.back()}
                >
                    <Text className="text-white">Go Back</Text>
                </Button>
            </Center>
        );
    }

    const sortedStations = [...ticketDetails.stations].sort(
      (a, b) => a.sequenceNumber - b.sequenceNumber
    );
    const fromStation = sortedStations[0];
    const toStation = sortedStations[sortedStations.length - 1];

    return (
        <Box className={`flex-1 p-4 ${bgColor}`} key={colorModeKey}>
            <HStack className="justify-between items-center mb-4">
                <Button
                    variant="link"
                    onPress={() => router.back()}
                    className={`${textColor}`}
                >
                    <Text className={`${textColor}`}>← Back</Text>
                </Button>
                <Heading className={`${textColor}`}>Ticket Details</Heading>
                <Box className="w-[50px]" /> {}
            </HStack>

            {showRefundForm ? (
                <VStack className="space-y-4">
                    <Text className={`font-semibold ${textColor}`}>Please provide a reason for your refund request:</Text>
                    <Input className={`border rounded ${borderColor}`}>
                        <InputField
                            value={refundReason}
                            onChangeText={setRefundReason}
                            placeholder="Enter your reason here"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className={`p-2 text-base ${textColor}`}
                        />
                    </Input>
                    <HStack className="space-x-2 justify-end">
                        <Button
                            className={`${isDark ? "bg-gray-700" : "bg-gray-300"}`}
                            onPress={() => setShowRefundForm(false)}
                        >
                            <Text className={textColor}>Cancel</Text>
                        </Button>
                        <Button
                            className={`${isDark ? "bg-blue-700" : "bg-blue-600"}`}
                            onPress={handleRefundRequest}
                        >
                            <Text className="text-white">Submit Request</Text>
                        </Button>
                    </HStack>
                </VStack>
            ) : (
                <ScrollView className="flex-1">
                    <VStack className="space-y-4">
                        <Box className={`p-3 rounded-lg ${cardBgColor}`}>
                            <Text className={`font-bold ${textColor}`}>Journey</Text>
                            <Text className={textColor}>From: {fromStation.name}</Text>
                            <Text className={textColor}>To: {toStation.name}</Text>
                            <Text className={textColor}>Date: {formatDate(ticketDetails.connectionDate)}</Text>
                            <Text className={textColor}>Departure: {formatTime(ticketDetails.departureTime)}</Text>
                            <Text className={textColor}>Arrival: {formatTime(ticketDetails.arrivalTime)}</Text>
                            <Button 
                                className={`mt-2 ${isDark ? "bg-blue-700" : "bg-blue-600"}`}
                                onPress={() => {
                                    
                                    const stationsJson = JSON.stringify(ticketDetails.stations);
                                    router.push({
                                        pathname: "/ticket/stations",
                                        params: { stations: stationsJson }
                                    });
                                }}
                            >
                                <Text className="text-white">View All Stations</Text>
                            </Button>
                        </Box>

                        <Box className={`p-3 rounded-lg ${cardBgColor}`}>
                            <Text className={`font-bold ${textColor}`}>Train Information</Text>
                            <Text className={textColor}>Operator: {ticketDetails.operatorName}</Text>
                            <Text className={textColor}>Train: {ticketDetails.trainName}</Text>
                            <Text className={textColor}>Status: {ticketDetails.status}</Text>
                            <Text className={textColor}>Ticket Number: {ticketDetails.ticketNumber}</Text>
                        </Box>

                        <Box className={`p-3 rounded-lg ${cardBgColor}`}>
                            <Text className={`font-bold ${textColor}`}>Passengers</Text>
                            {ticketDetails.people.map((person, index) => (
                                <Box key={index} className="mb-2">
                                    <Text className={textColor}>{person.firstName} {person.lastName}</Text>
                                    <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                        {person.discount ? `Discount: ${person.discount}` : 'No discount'}
                                    </Text>
                                </Box>
                            ))}
                        </Box>

                        <Box className={`p-3 rounded-lg ${cardBgColor}`}>
                            <Text className={`font-bold ${textColor}`}>Seats</Text>
                            <Text className={textColor}>{ticketDetails.seatNumbers ? ticketDetails.seatNumbers.join(', ') : 'No seat numbers'}</Text>
                        </Box>

                        {qrCode && ticketDetails.status === "PAID" ? (
                            <Box className="items-center">
                                <Text className={`font-bold mb-2 ${textColor}`}>QR Code</Text>
                                <Image
                                    source={{ uri: qrCode }}
                                    accessibilityLabel="QR Code"
                                    width={200}
                                    height={200}
                                    className="rounded-md"
                                />
                            </Box>
                        ) : null}

                        <Box className="mt-4 mb-8">
                            {isCurrentTab ? (
                                <Button
                                    className={`w-full mb-2 ${isDark ? "bg-red-700" : "bg-red-600"}`}
                                    onPress={() => router.push(`/ticket/cancel?id=${ticketDetails.id}`)}
                                >
                                    <Text className="text-white">Cancel Ticket</Text>
                                </Button>
                            ) : null}

                            {!isCurrentTab && ticketDetails.status === "PAID" ? (
                                <Button
                                    className={`w-full ${isDark ? "bg-blue-700" : "bg-blue-600"}`}
                                    onPress={() => setShowRefundForm(true)}
                                >
                                    <Text className="text-white">Refund Request</Text>
                                </Button>
                            ) : !isCurrentTab && ticketDetails.status === "CANCELLED" ? (
                                <Box className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                                    <Text className={`text-center ${isDark ? "text-yellow-200" : "text-yellow-800"}`}>
                                        Refund is not available for cancelled tickets
                                    </Text>
                                </Box>
                            ) : null}
                        </Box>
                    </VStack>
                </ScrollView>
            )}


        </Box>
    );
}
