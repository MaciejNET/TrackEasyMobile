import React, { useState, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Image,
    HStack,
    InputField,
    ScrollView,
    Divider
} from "@gluestack-ui/themed";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import ticketApi from "@/services/ticket";
import { useColorMode } from "@/hooks/useColorMode";
import { TicketDetails, QrCode, RefundRequest } from "@/schemas/ticket";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function TicketDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";
    const textColor = isDark ? "text-white" : "text-black";
    const bgColor = isDark ? "bg-gray-800" : "bg-white";
    const cardBgColor = isDark ? "bg-gray-700" : "bg-gray-100";
    const borderColor = isDark ? "border-gray-600" : "border-gray-300";

    const [refundReason, setRefundReason] = useState("");
    const [showRefundForm, setShowRefundForm] = useState(false);

    // Fetch ticket details
    const {
        data: ticketDetails,
        isLoading: detailsLoading,
        refetch: refetchDetails,
    } = useQuery({
        queryKey: ["ticketDetails", id],
        queryFn: () => ticketApi.getTicketDetails(id),
        enabled: !!id,
    });

    // Fetch QR code if available
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

        try {
            const refundData: RefundRequest = {
                userId: user.id,
                ticketId: ticketDetails.id,
                reason: refundReason.trim() || "No reason provided"
            };

            await ticketApi.requestRefund(refundData);
            setShowRefundForm(false);
            setRefundReason("");
            refetchDetails();
        } catch (error) {
            console.error("Failed to request refund:", error);
        }
    };

    // Check if journey has started to determine which button to show
    const isJourneyStarted = (ticket: TicketDetails): boolean => {
        if (!ticket) return false;

        const now = new Date();
        const departureTime = new Date(ticket.departureTime);
        return now > departureTime;
    };

    if (detailsLoading) {
        return (
            <Center flex={1}>
                <Spinner size="large" />
            </Center>
        );
    }

    if (!ticketDetails) {
        return (
            <Center flex={1} className={bgColor}>
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
                <Heading className={`${textColor}`}>Ticket Details</Heading>
                <Box width={50} /> {/* Empty box for alignment */}
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
                            <Text className={textColor}>From: {ticketDetails.stations[0]?.name}</Text>
                            <Text className={textColor}>To: {ticketDetails.stations[ticketDetails.stations.length - 1]?.name}</Text>
                            <Text className={textColor}>Date: {new Date(ticketDetails.connectionDate).toLocaleDateString()}</Text>
                            <Text className={textColor}>Departure: {ticketDetails.departureTime}</Text>
                            <Text className={textColor}>Arrival: {ticketDetails.arrivalTime}</Text>
                            <Button 
                                className={`mt-2 ${isDark ? "bg-blue-700" : "bg-blue-600"}`}
                                onPress={() => {
                                    // Navigate to the stations screen with the stations data
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

                        {qrCode && (
                            <Box className="items-center">
                                <Text className={`font-bold mb-2 ${textColor}`}>QR Code</Text>
                                <Image
                                    source={{ uri: qrCode }}
                                    alt="QR Code"
                                    width={200}
                                    height={200}
                                    className="rounded-md"
                                />
                            </Box>
                        )}

                        <Box className="mt-4 mb-8">
                            {!isJourneyStarted(ticketDetails) ? (
                                <Button
                                    className={`w-full ${isDark ? "bg-red-700" : "bg-red-600"}`}
                                    onPress={() => router.push(`/ticket/cancel?id=${ticketDetails.id}`)}
                                >
                                    <Text className="text-white">Cancel Ticket</Text>
                                </Button>
                            ) : (
                                <Button
                                    className={`w-full ${isDark ? "bg-blue-700" : "bg-blue-600"}`}
                                    onPress={() => setShowRefundForm(true)}
                                >
                                    <Text className="text-white">Refund Request</Text>
                                </Button>
                            )}
                        </Box>
                    </VStack>
                </ScrollView>
            )}


        </Box>
    );
}
