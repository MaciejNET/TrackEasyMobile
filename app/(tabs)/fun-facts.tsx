import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";

export default function TriviaScreen() {
  return (
    <Box className="flex-1 p-4">
      <Center>
        <VStack space="md">
          <Heading size="xl">Fun Facts</Heading>
          <Text>Fun Facts from each city will appear here.</Text>
        </VStack>
      </Center>
    </Box>
  );
}
