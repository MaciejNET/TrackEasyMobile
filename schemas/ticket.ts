import { z } from 'zod';

// Ticket ID schema (nullable GUID)
export const ticketIdSchema = z.string().uuid().nullable();

export type TicketId = z.infer<typeof ticketIdSchema>;

export const ticketDetailsSchema = z.object({
    id: z.string(),
    status: z.string(),
    departureStation: z.string(),
    arrivalStation: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    passengerName: z.string(),
    qrCodeId: z.string(),
});

export const qrCodeSchema = z.object({
    id: z.string(),
    imageUrl: z.string(),
});