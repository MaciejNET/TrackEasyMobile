import { useQuery } from '@tanstack/react-query';
import { ticketApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export function useCurrentTicket() {
  const { token, isAuthenticated } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['currentTicket'],
    queryFn: async () => {
      if (!token) return null;
      return await ticketApi.getCurrentTicket();
    },
    enabled: !!token && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    currentTicketId: data,
    isLoading,
    error,
    refetch,
  };
}