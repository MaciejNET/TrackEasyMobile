import { z } from 'zod';

// Ticket ID schema (nullable GUID)
export const ticketIdSchema = z.string().uuid().nullable();

export type TicketId = z.infer<typeof ticketIdSchema>;