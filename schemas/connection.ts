import { z } from 'zod';

export const connectionSchema = z.object({
    id: z.string(),
    departureStationName: z.string(),
    arrivalStationName: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
});

export const connectionsResponseSchema = z.object({
    items: z.array(connectionSchema),
    nextCursor: z.string().nullable(),
    hasNextPage: z.boolean(),
});

export type Connection = z.infer<typeof connectionSchema>;
export type ConnectionsResponse = z.infer<typeof connectionsResponseSchema>;
