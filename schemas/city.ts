import { z } from 'zod';

// Schema for ticket arrival data
export const ticketArrivalSchema = z.object({
  cityName: z.string(),
  arrivalTime: z.string(),
});

// Schema for a list of ticket arrivals
export const ticketArrivalListSchema = z.array(ticketArrivalSchema);

// Schema for the country data
export const countrySchema = z.object({
  id: z.string(),
  name: z.string(),
});

// Schema for the ticket city data
export const ticketCitySchema = z.object({
  id: z.string(),
  name: z.string(),
  sequenceNumber: z.number(),
  isLocked: z.boolean(),
});

// Schema for the city details data
export const cityDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: countrySchema,
  funFacts: z.array(z.string()),
});

// Schema for a list of ticket cities
export const ticketCityListSchema = z.array(ticketCitySchema);

// Type definitions
export type Country = z.infer<typeof countrySchema>;
export type TicketCity = z.infer<typeof ticketCitySchema>;
export type CityDetails = z.infer<typeof cityDetailsSchema>;
export type TicketArrival = z.infer<typeof ticketArrivalSchema>;
