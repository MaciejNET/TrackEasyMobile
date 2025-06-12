import { z } from 'zod';

export const ticketArrivalSchema = z.object({
  cityName: z.string(),
  arrivalTime: z.string(),
});

export const ticketArrivalListSchema = z.array(ticketArrivalSchema);

export const countrySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export const ticketCitySchema = z.object({
  id: z.string(),
  name: z.string(),
  sequenceNumber: z.number(),
  isLocked: z.boolean(),
});

export const cityDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: countrySchema,
  funFacts: z.array(z.string()),
});

export const ticketCityListSchema = z.array(ticketCitySchema);
export type Country = z.infer<typeof countrySchema>;
export type TicketCity = z.infer<typeof ticketCitySchema>;
export type CityDetails = z.infer<typeof cityDetailsSchema>;
export type TicketArrival = z.infer<typeof ticketArrivalSchema>;
