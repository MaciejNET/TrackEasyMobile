import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { LogBox } from "react-native";

export default function Index() {
  const { isLoading } = useAuth();
  LogBox.ignoreAllLogs();

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  return <Redirect href="/(tabs)" />;
}
