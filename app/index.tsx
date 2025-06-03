import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';

export default function Index() {
  const { isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  // Always redirect to tabs regardless of authentication status
  return <Redirect href="/(tabs)" />;
}
