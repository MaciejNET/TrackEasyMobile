import { z } from 'zod';

// Ticket ID schema (nullable GUID)
export const ticketIdSchema = z.string().uuid().nullable();

export type TicketId = z.infer<typeof ticketIdSchema>;

// Ticket list item schema
export const ticketSchema = z.object({
  id: z.string().uuid(),
  startStation: z.string(),
  endStation: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  connectionDate: z.string(),
});

export type Ticket = z.infer<typeof ticketSchema>;

// Pagination response schema
export const paginatedTicketsSchema = z.object({
  items: z.array(ticketSchema),
  pageNumber: z.number(),
  pageSize: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});

export type PaginatedTickets = z.infer<typeof paginatedTicketsSchema>;

// Person schema for ticket details
export const personSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  discount: z.string().nullable(),
});

// Station schema for ticket details
export const stationSchema = z.object({
  name: z.string(),
  arrivalTime: z.string().nullable(),
  departureTime: z.string().nullable(),
  sequenceNumber: z.number(),
});

export type Station = z.infer<typeof stationSchema>;

// Ticket details schema
export const ticketDetailsSchema = z.object({
  id: z.string().uuid(),
  ticketNumber: z.number(),
  people: z.array(personSchema),
  seatNumbers: z.array(z.number()).nullable(),
  connectionDate: z.string(),
  stations: z.array(stationSchema),
  operatorCode: z.string(),
  operatorName: z.string(),
  trainName: z.string(),
  qrCodeId: z.string().uuid().nullable(),
  status: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
});

export type TicketDetails = z.infer<typeof ticketDetailsSchema>;

// QR code type - just a base64 string for the image
export type QrCode = string;

// Refund request schema
export const refundRequestSchema = z.object({
  userId: z.string().uuid(),
  ticketId: z.string().uuid(),
  reason: z.string(),
});

export type RefundRequest = z.infer<typeof refundRequestSchema>;
