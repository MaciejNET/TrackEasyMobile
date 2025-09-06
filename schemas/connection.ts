import { z } from 'zod';


export const connectionDetailSchema = z.object({
    id: z.string(),
    name: z.string(),
    operatorName: z.string(),
    operatorCode: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    departureStationId: z.string(),
    departureStation: z.string(),
    arrivalStationId: z.string(),
    arrivalStation: z.string(),
    price: z.object({
        amount: z.number(),
        currency: z.number(),
    }),
    duration: z.string(),
}).passthrough(); 

export const connectionItemSchema = z.object({
    connections: z.array(connectionDetailSchema),
    transfersCount: z.number(),
    startStation: z.string(),
    endStation: z.string(),
    departureTime: z.string(),
    arrivalTime: z.string(),
    totalDuration: z.string(),
}).passthrough(); 

export const connectionsResponseSchema = z.object({
    items: z.array(connectionItemSchema),
    nextCursor: z.string().nullable(),
    hasNextPage: z.boolean(),
}).passthrough(); 


export const fallbackConnectionsResponseSchema = z.object({
    items: z.array(z.record(z.any())).optional().default([]),
    nextCursor: z.string().nullable().optional().default(null),
    hasNextPage: z.boolean().optional().default(false),
}).passthrough();

export type ConnectionDetail = z.infer<typeof connectionDetailSchema>;
export type ConnectionItem = z.infer<typeof connectionItemSchema>;
export type ConnectionsResponse = z.infer<typeof connectionsResponseSchema>;
