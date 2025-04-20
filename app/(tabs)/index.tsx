import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";

export default function TicketsScreen() {
  return (
    <Box className="flex-1 p-4">
      <Center>
        <VStack space="md">
          <Heading size="xl">Tickets</Heading>
          <Text>Your tickets will appear here</Text>
        </VStack>
      </Center>
    </Box>
  );
}