import { z } from 'zod';

export const stationSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const nearestStationSchema = z.object({
    id: z.string(),
    name: z.string(),
    city: z.string(),
});

export const stationListSchema = z.array(stationSchema);

export type Station = z.infer<typeof stationSchema>;
export type NearestStation = z.infer<typeof nearestStationSchema>;
