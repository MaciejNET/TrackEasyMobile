import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";

export default function SearchScreen() {
  return (
    <Box className="flex-1 p-4">
      <VStack space="lg">
        <Heading size="xl">Search</Heading>
        <Center>
          <Text>Search results will appear here</Text>
        </Center>
      </VStack>
    </Box>
  );
}