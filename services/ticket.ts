import api from "./api";
import { ticketDetailsSchema, qrCodeSchema } from "@/schemas/ticket";

export const getTicketDetails = async (ticketId: string) => {
    const res = await api.get(`/tickets/${ticketId}/details`);
    const validation = ticketDetailsSchema.safeParse(res.data);

    if (!validation.success) {
        console.error(validation.error);
        throw new Error("Invalid ticket details data");
    }

    return validation.data;
};

export const getQrCode = async (qrCodeId: string) => {
    const res = await api.get(`/tickets/qr-code/${qrCodeId}`);
    const validation = qrCodeSchema.safeParse(res.data);

    if (!validation.success) {
        console.error(validation.error);
        throw new Error("Invalid QR code data");
    }

    return validation.data;
};

export const cancelTicket = async (ticketId: string) => {
    await api.post(`/tickets/${ticketId}/cancel`);
};

export const requestRefund = async ({
        userId,
        ticketId,
        reason,
    }: {
    userId: string;
    ticketId: string;
    reason: string;
}) => {
    await api.post("/tickets/refund-request", {
        userId,
        ticketId,
        reason,
    });
};
