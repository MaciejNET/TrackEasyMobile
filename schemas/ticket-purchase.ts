import { z } from 'zod';

// Schema for discount
export const discountSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type Discount = z.infer<typeof discountSchema>;

// Schema for discount code
export const discountCodeSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  percentage: z.number(),
  from: z.string(), // ISO date string
  to: z.string(), // ISO date string
});

export type DiscountCode = z.infer<typeof discountCodeSchema>;

// Schema for person (passenger)
export const personDtoSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: 'Date must be in YYYY-MM-DD format' 
  }),
  discountId: z.string().uuid().nullable().optional(),
});

export type PersonDto = z.infer<typeof personDtoSchema>;

// Schema for ticket connection
export const ticketConnectionDtoSchema = z.object({
  id: z.string().uuid(),
  startStationId: z.string().uuid(),
  endStationId: z.string().uuid(),
  connectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { 
    message: 'Date must be in YYYY-MM-DD format' 
  }),
});

export type TicketConnectionDto = z.infer<typeof ticketConnectionDtoSchema>;

// Schema for buy ticket command
export const buyTicketCommandSchema = z.object({
  email: z.string().email({ message: 'Valid email is required' }),
  passengers: z.array(personDtoSchema).min(1, { message: 'At least one passenger is required' }),
  discountCodeId: z.string().uuid().nullable().optional(),
  connections: z.array(ticketConnectionDtoSchema).min(1, { message: 'At least one connection is required' }),
});

export type BuyTicketCommand = z.infer<typeof buyTicketCommandSchema>;

// Schema for payment by card command
export const payTicketByCardCommandSchema = z.object({
  ticketIds: z.array(z.string().uuid()),
  currency: z.enum(['PLN', 'EUR', 'USD']),
  cardNumber: z.string().regex(/^\d{16}$/, { message: 'Card number must be 16 digits' }),
  cardExpMonth: z.number().min(1).max(12),
  cardExpYear: z.number().min(new Date().getFullYear() % 100).max(99),
  cardCvc: z.string().regex(/^\d{3,4}$/, { message: 'CVC must be 3 or 4 digits' }),
});

export type PayTicketByCardCommand = z.infer<typeof payTicketByCardCommandSchema>;

// Schema for ticket price response
export const ticketPriceResponseSchema = z.object({
  price: z.number(),
  currency: z.enum(['PLN', 'EUR', 'USD']),
});

export type TicketPriceResponse = z.infer<typeof ticketPriceResponseSchema>;