import { Ionicons } from "@expo/vector-icons";
import {Box} from "@/components/ui/box";
import {Text} from "@/components/ui/text";

export default function AccountScreen() {
  return (
    <Box className="flex-1 p-4">
      <Box className="flex flex-col items-center space-y-4">
        <Text className="text-2xl font-bold">Account</Text>

        <Box className="w-20 h-20 bg-blue-500 rounded-full mt-4 items-center justify-center">
          <Ionicons name="person" size={32} color="white" />
        </Box>

        <Text className="text-lg font-bold mt-2">
          User Name
        </Text>
        <Text>user@example.com</Text>
      </Box>
    </Box>
  );
}
