import { useQuery } from '@tanstack/react-query';
import authApi from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';

export function useUser() {
  const { token, user, refreshUser } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (!token) return null;
      return await authApi.getCurrentUser(token);
    },
    enabled: !!token,
    initialData: user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: data,
    isLoading,
    error,
    refetch,
    refreshUser,
  };
}
