import { useUser } from "@/hooks/useUser";
import { useCurrentTicket } from "@/hooks/useCurrentTicket";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Center } from "@/components/ui/center";
import { ScrollView } from "react-native";
import axios from "axios";
import { Pressable } from "react-native";
import { Lock } from "lucide-react-native";
import { useColorMode } from "@gluestack-ui/themed";
import { Spinner } from "@/components/ui/spinner";
import { HStack } from "@/components/ui/hstack";

type City = {
    id: string;
    name: string;
    isLocked: boolean;
    sequenceNumber: number;
};

export default function TriviaScreen() {
    const user = useUser();
    const currentTicketId = useCurrentTicket();
    const router = useRouter();
    const colorMode = useColorMode(); // "light" | "dark"

    const { data, isLoading, error } = useQuery<City[]>({
        queryKey: ["ticket-cities", currentTicketId],
        queryFn: async () => {
            const response = await axios.get(
                `https://trackeasy-api-axaaadhhapfvg8cx.polandcentral-01.azurewebsites.net/ticket/${currentTicketId}/cities`
            );
            return response.data;
        },
        enabled: !!currentTicketId,
    });

    if (!user) {
        return (
            <Box className="flex-1 p-4">
                <Center>
                    <VStack space="md">
                        <Heading size="xl">Fun Facts</Heading>
                        <Text>Musisz być zalogowany, aby zobaczyć ciekawostki.</Text>
                    </VStack>
                </Center>
            </Box>
        );
    }

    if (!currentTicketId) {
        return (
            <Box className="flex-1 p-4">
                <Center>
                    <VStack space="md">
                        <Heading size="xl">Fun Facts</Heading>
                        <Text>Aktualnie nie jesteś w podróży.</Text>
                    </VStack>
                </Center>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box className="flex-1 justify-center items-center">
                <Spinner size="large" />
            </Box>
        );
    }

    if (error || !data) {
        return (
            <Box className="flex-1 p-4">
                <Center>
                    <Text className="text-red-500">Wystąpił błąd podczas ładowania miast.</Text>
                </Center>
            </Box>
        );
    }

    const cities = data.sort((a: City, b: City) => a.sequenceNumber - b.sequenceNumber);

    return (
        <ScrollView className="flex-1 p-4">
            <VStack space="md">
                <Heading size="xl">Fun Facts</Heading>
                {cities.map((city: City) => (
                    <Pressable
                        key={city.id}
                        disabled={city.isLocked}
                        onPress={() => router.push(`/fun-facts/${city.id}`)}
                        style={{
                            opacity: city.isLocked ? 0.5 : 1,
                            backgroundColor: colorMode === "dark" ? "#1f2937" : "#f3f4f6",
                            padding: 16,
                            borderRadius: 12,
                            marginBottom: 8,
                        }}
                    >
                        <HStack className="flex-row justify-between items-center">
                            <Text size="lg">{city.name}</Text>
                            {city.isLocked && <Lock size={20} color={colorMode === "dark" ? "#fff" : "#000"} />}
                        </HStack>
                    </Pressable>
                ))}
            </VStack>
        </ScrollView>
    );
}
