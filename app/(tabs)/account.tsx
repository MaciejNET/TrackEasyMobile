import { Ionicons } from "@expo/vector-icons";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";
import { Spinner } from "@/components/ui/spinner";
import { useColorMode } from "@/hooks/useColorMode";

export default function AccountScreen() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const { colorMode } = useColorMode();

  // Define theme-based styles
  const isDark = colorMode === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const buttonBgColor = isDark ? "bg-white" : "bg-black";
  const buttonTextColor = isDark ? "text-black" : "text-white";

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="flex-1 p-4">
        <Box className="flex flex-col items-center space-y-4">
          <Text className={`text-2xl font-bold ${textColor}`}>Account</Text>

          <Box className="w-20 h-20 bg-gray-300 rounded-full mt-4 items-center justify-center">
            <Ionicons name="person-outline" size={32} color={isDark ? "white" : "black"} />
          </Box>

          <Text className={`text-lg text-center mt-4 mb-2 ${textColor}`}>
            Please sign in to view your account details
          </Text>

          <Button 
            onPress={() => router.push('/auth/login')}
            className={`mt-4 w-full ${buttonBgColor} border border-gray-300`}
          >
            <Text className={`font-medium ${buttonTextColor}`}>Sign In</Text>
          </Button>

          <Button 
            onPress={() => router.push('/auth/register')}
            className={`mt-2 w-full ${buttonBgColor} border border-gray-300`}
          >
            <Text className={`font-medium ${buttonTextColor}`}>Create Account</Text>
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="flex-1 p-4">
      <Box className="flex flex-col items-center space-y-4">
        <Text className={`text-2xl font-bold ${textColor}`}>Account</Text>

        <Box className={`w-20 h-20 ${isDark ? 'bg-blue-400' : 'bg-blue-500'} rounded-full mt-4 items-center justify-center`}>
          <Ionicons name="person" size={32} color={isDark ? "black" : "white"} />
        </Box>

        <Text className={`text-lg font-bold mt-2 ${textColor}`}>
          {user.firstName} {user.lastName}
        </Text>
        <Text className={textColor}>{user.email}</Text>

        <Box className="mt-4 w-full">
          {user.operatorId ? (
            <Box className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4 mb-4 border ${isDark ? 'border-white' : 'border-gray-300'}`}>
              <Text className={`${isDark ? 'text-gray-300' : 'text-gray-500'} mb-1`}>Operator ID</Text>
              <Text className={`font-medium ${textColor}`}>{user.operatorId}</Text>
            </Box>
          ) : null}
        </Box>

        <Button 
          onPress={handleLogout}
          className={`mt-6 w-full ${buttonBgColor} border border-gray-300`}
        >
          <Text className={`font-medium ${buttonTextColor}`}>Logout</Text>
        </Button>
      </Box>
    </Box>
  );
}
