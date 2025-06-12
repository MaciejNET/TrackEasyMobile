import { useQuery } from '@tanstack/react-query';
import baseApi from '@/services/baseApi';
import { stationListSchema } from '@/schemas/station';

export const useStationsQuery = () =>
    useQuery({
        queryKey: ['stations'],
        queryFn: async () => {
            const res = await baseApi.get('/system-lists/stations');
            const parsed = stationListSchema.safeParse(res.data);
            if (!parsed.success) throw new Error('Invalid stations data');
            return parsed.data;
        },
    });
