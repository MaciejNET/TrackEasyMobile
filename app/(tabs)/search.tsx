import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStationsQuery } from '@/hooks/useStationsQuery';
import { useConnectionsQuery } from '@/hooks/useConnectionsQuery';
import { z } from 'zod';
import { useState } from 'react';
import { FlatList } from 'react-native';

import { Select, SelectItem } from '@gluestack-ui/themed';
import { Input, InputField } from '@gluestack-ui/themed';

const formSchema = z.object({
    departureStationId: z.string().min(1, 'Wymagane'),
    arrivalStationId: z.string().min(1, 'Wymagane'),
    departureTime: z.string().min(1, 'Wymagane'),
});

type FormValues = z.infer<typeof formSchema>;

export default function SearchScreen() {
    const { data: stations } = useStationsQuery();
    const [searchParams, setSearchParams] = useState<FormValues | null>(null);

    const {
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
    } = useConnectionsQuery(
        searchParams
            ? {
                startStationId: searchParams.departureStationId,
                endStationId: searchParams.arrivalStationId,
                departureTime: searchParams.departureTime,
            }
            : {
                startStationId: '',
                endStationId: '',
                departureTime: '',
            }
    );

    const onSubmit = (values: FormValues) => {
        setSearchParams(values);
    };

    return (
        <Box className="flex-1 p-4">
            <VStack space="lg">
                <Heading size="xl">Szukaj połączenia</Heading>

                <Text>Stacja początkowa</Text>
                <Select onValueChange={(v: string) => setValue('departureStationId', v)}>
                    {stations?.map((station) => (
                        <SelectItem
                            key={station.id}
                            label={station.name}
                            value={station.id}
                        />
                    ))}
                </Select>

                <Text>Stacja końcowa</Text>
                <Select onValueChange={(v: string) => setValue('arrivalStationId', v)}>
                    {stations?.map((station) => (
                        <SelectItem
                            key={station.id}
                            label={station.name}
                            value={station.id}
                        />
                    ))}
                </Select>

                <Text>Data i godzina (ISO)</Text>
                <Input>
                    <InputField
                        placeholder="2025-06-10T12:30"
                        onChangeText={(v: string) => setValue('departureTime', v)}
                    />
                </Input>

                <Button onPress={handleSubmit(onSubmit)}>Szukaj</Button>

                {Array.isArray(data?.items) && (
                    <FlatList
                        data={data.items}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Box className="border p-2 my-2 rounded">
                                <Text>
                                    {item.departureStationName} → {item.arrivalStationName}
                                </Text>
                                <Text>
                                    {item.departureTime} - {item.arrivalTime}
                                </Text>
                            </Box>
                        )}
                        ListFooterComponent={
                            hasNextPage && !isFetching ? (
                                <Button onPress={() => fetchNextPage()}>Załaduj więcej</Button>
                            ) : null
                        }
                    />
                )}
            </VStack>
        </Box>
    );
}
