import { useInfiniteQuery } from '@tanstack/react-query';
import baseApi from '@/services/baseApi';
import {
    connectionsResponseSchema,
    ConnectionsResponse,
} from '@/schemas/connection';

interface QueryParams {
    startStationId: string;
    endStationId: string;
    departureTime: string;
}

export const useConnectionsQuery = (params: QueryParams) =>
    useInfiniteQuery<
        ConnectionsResponse,
        Error,
        ConnectionsResponse,
        [string, QueryParams],
        string | null
    >({
        queryKey: ['connections', params],
        queryFn: async ({ pageParam }) => {
            const res = await baseApi.get('/connections', {
                params: {
                    ...params,
                    departureTime: pageParam,
                },
            });

            const parsed = connectionsResponseSchema.safeParse(res.data);
            if (!parsed.success) throw new Error('Invalid connections data');
            return parsed.data;
        },
        initialPageParam: params.departureTime, // 🔥 TO BYŁO WYMAGANE
        getNextPageParam: (lastPage) =>
            lastPage.hasNextPage ? lastPage.nextCursor : undefined,
        enabled:
            !!params.startStationId &&
            !!params.endStationId &&
            !!params.departureTime,
    });
