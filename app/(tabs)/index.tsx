import React, { useState } from "react";
import {
    Box,
    Text,
    VStack,
    Heading,
    Center,
    Pressable,
    FlatList,
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Image,
    Spinner,
    HStack,
    AlertDialog,
    AlertDialogBackdrop,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogBody,
    Input, InputField
} from "@gluestack-ui/themed";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import {
    getTicketDetails,
    getQrCode,
    cancelTicket,
    requestRefund,
} from "@/services/ticket";
import {useAuth} from "@/contexts/AuthContext";

type Ticket = {
    id: string;
    status: string;
};

const PAGE_SIZE = 10;

const fetchTickets = async (
    userId: string,
    type: number,
    page: number
): Promise<{ items: Ticket[]; hasMore: boolean }> => {
    const res = await fetch(
        `https://trackeasy-api-axaaadhhapfvg8cx.polandcentral-01.azurewebsites.net/tickets/${userId}?type=${type}&pageNumber=${page}&pageSize=${PAGE_SIZE}`
    );
    return res.json();
};

export default function TicketsScreen() {
    const { user } = useAuth();
    const [tab, setTab] = useState<"current" | "archive">("current");
    const [page, setPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [ticketDetails, setTicketDetails] = useState<any>(null);
    const [qrCode, setQrCode] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
    const [refundReason, setRefundReason] = useState("");

    const {
        data,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["tickets", user?.id, tab, page],
        queryFn: () =>
            fetchTickets(user!.id, tab === "current" ? 0 : 1, page),
        enabled: !!user?.id,
    });

    const handleTicketPress = async (ticket: Ticket) => {
        try {
            setLoadingDetails(true);
            setSelectedTicket(ticket);
            setShowModal(true);

            const details = await getTicketDetails(ticket.id);
            setTicketDetails(details);

            const qr = await getQrCode(details.qrCodeId);
            setQrCode(qr);
        } catch (e) {
            console.error("Failed to load ticket details", e);
        } finally {
            setLoadingDetails(false);
        }
    };

    if (!user) {
        return (
            <Center flex={1}>
                <Text>You must be logged in to view your tickets.</Text>
            </Center>
        );
    }

    return (
        <Box className="flex-1 p-4">
            <Heading className="mb-4">Your Tickets</Heading>

            <HStack className="mb-4 space-x-6">
                <Pressable onPress={() => { setTab("current"); setPage(1); refetch(); }}>
                    <Text className={tab === "current" ? "font-bold" : ""}>Current</Text>
                </Pressable>
                <Pressable onPress={() => { setTab("archive"); setPage(1); refetch(); }}>
                    <Text className={tab === "archive" ? "font-bold" : ""}>Archive</Text>
                </Pressable>
            </HStack>

            {isLoading ? (
                <Spinner />
            ) : (
                <FlatList
                    data={(data?.items || []) as Ticket[]}
                    keyExtractor={(item) => (item as Ticket).id}
                    renderItem={({ item }) => {
                        const ticket = item as Ticket;
                        return (
                            <Pressable onPress={() => handleTicketPress(ticket)}>
                                <Box className="py-2 border-b border-gray-300">
                                    <Text>Ticket ID: {ticket.id}</Text>
                                    <Text>Status: {ticket.status}</Text>
                                </Box>
                            </Pressable>
                        );
                    }}
                    ListFooterComponent={() =>
                        data?.hasMore && (
                            <Button className="mt-4" onPress={() => setPage((p) => p + 1)}>
                                Load more
                            </Button>
                        )
                    }
                />
            )}

            <Modal isOpen={showModal} onClose={() => { setShowModal(false); setRefundReason(""); }}>
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Heading className="text-lg font-bold">Ticket Details</Heading>
                    </ModalHeader>
                    <ModalBody>
                        {loadingDetails ? (
                            <Spinner />
                        ) : (
                            <VStack className="space-y-4">
                                <Text>From: {ticketDetails?.departureStation}</Text>
                                <Text>To: {ticketDetails?.arrivalStation}</Text>
                                <Text>Departure Time: {ticketDetails?.departureTime}</Text>
                                <Text>Status: {ticketDetails?.status}</Text>
                                {qrCode && (
                                    <Image
                                        source={{ uri: qrCode.imageUrl }}
                                        alt="QR Code"
                                        width={150}
                                        height={150}
                                        className="rounded-md"
                                    />
                                )}

                                <Text className="font-semibold mt-4">Refund reason:</Text>
                                <Input className="border rounded mt-2">
                                    <InputField
                                        value={refundReason}
                                        onChangeText={setRefundReason}
                                        placeholder="Enter your reason here"
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        className="p-2 text-base"
                                    />
                                </Input>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            className="border border-gray-400 px-4 py-2 rounded mr-2"
                            onPress={() => setConfirmCancelOpen(true)}
                        >
                            Cancel Ticket
                        </Button>
                        <Button
                            className="bg-black px-4 py-2 rounded text-white"
                            onPress={async () => {
                                await requestRefund({
                                    userId: user.id,
                                    ticketId: ticketDetails.id,
                                    reason: refundReason.trim() || "No reason provided",
                                });
                                setShowModal(false);
                                setRefundReason("");
                                refetch();
                            }}
                        >
                            Request Refund
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <AlertDialog
                isOpen={confirmCancelOpen}
                onClose={() => setConfirmCancelOpen(false)}
            >
                <AlertDialogBackdrop />
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Text className="text-lg font-bold">Confirm Cancellation</Text>
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <Text>Are you sure you want to cancel this ticket?</Text>
                    </AlertDialogBody>
                    <AlertDialogFooter className="flex-row justify-end space-x-4 mt-4">
                        <Button
                            className="border border-gray-400 px-4 py-2 rounded"
                            onPress={() => setConfirmCancelOpen(false)}
                        >
                            No
                        </Button>
                        <Button
                            className="bg-red-600 px-4 py-2 rounded text-white"
                            onPress={async () => {
                                if (ticketDetails?.id) {
                                    await cancelTicket(ticketDetails.id);
                                    setConfirmCancelOpen(false);
                                    setShowModal(false);
                                    setRefundReason("");
                                    refetch();
                                }
                            }}
                        >
                            Yes, Cancel
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Box>
    );
}
