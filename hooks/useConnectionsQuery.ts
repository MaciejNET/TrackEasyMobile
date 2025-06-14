import { useInfiniteQuery } from '@tanstack/react-query';
import searchApi from '@/services/searchApi';
import {
    connectionsResponseSchema,
    fallbackConnectionsResponseSchema,
    ConnectionsResponse,
} from '@/schemas/connection';

interface QueryParams {
    startStationId: string;
    endStationId: string;
    departureTime: string;
}

export const useConnectionsQuery = (params: QueryParams) => {
    return useInfiniteQuery<
        ConnectionsResponse,
        Error,
        ConnectionsResponse,
        [string, QueryParams],
        string | null
    >({
        queryKey: ['connections', params],
        queryFn: async ({ pageParam }) => {
            try {
                const res = await searchApi.get('/connections', {
                    params: {
                        ...params,
                        departureTime: pageParam,
                    },
                    timeout: 30000, 
                });

                try {
                    
                    const parsed = connectionsResponseSchema.safeParse(res.data);
                    if (parsed.success) {
                        return parsed.data;
                    }

                    
                    const fallbackParsed = fallbackConnectionsResponseSchema.safeParse(res.data);
                    if (fallbackParsed.success) {
                        return fallbackParsed.data as ConnectionsResponse;
                    }

                    
                    throw new Error(`Invalid connections data: ${parsed.error.message}`);
                } catch (validationError) {
                    throw validationError;
                }
            } catch (error) {
                throw error;
            }
        },
        initialPageParam: params.departureTime,
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.nextCursor : undefined;
        },
        enabled:
            !!params.startStationId &&
            !!params.endStationId &&
            !!params.departureTime,
    });
};
