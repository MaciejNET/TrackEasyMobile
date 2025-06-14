import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStationsQuery } from '@/hooks/useStationsQuery';
import { useNearestStation } from '@/hooks/useNearestStation';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorMode } from '@/hooks/useColorMode';

import { 
    Select, 
    SelectItem, 
    SelectTrigger, 
    SelectInput, 
    SelectIcon, 
    SelectPortal, 
    SelectBackdrop, 
    SelectContent, 
    SelectDragIndicatorWrapper, 
    SelectDragIndicator,
    SelectScrollView
} from '@/components/ui/select';
import { Input, InputField } from '@/components/ui/input';
import { HStack } from '@/components/ui/hstack';
import { Ionicons } from '@expo/vector-icons';

const formSchema = z.object({
    departureStationId: z.string().min(1, 'Required'),
    arrivalStationId: z.string().min(1, 'Required'),
    departureTime: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function SearchScreen() {
    const router = useRouter();
    const { colorMode, colorModeKey } = useColorMode();
    const { data: stations, isLoading: isLoadingStations } = useStationsQuery();
    const { data: nearestStation, isLoading: isLoadingNearestStation } = useNearestStation();
    const [searchParams, setSearchParams] = useState<FormValues | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Initialize manual date/time with current date/time
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const [manualDate, setManualDate] = useState(formatDate(new Date()));
    const [manualTime, setManualTime] = useState(formatTime(new Date()));

    const {
        setValue,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    // Update manual date/time fields when selectedDate changes
    useEffect(() => {
        setManualDate(formatDate(selectedDate));
        setManualTime(formatTime(selectedDate));
    }, [selectedDate]);

    // Automatically update selectedDate and form value when manual date/time changes
    useEffect(() => {
        try {
            // Parse the date and time
            const [year, month, day] = manualDate.split('-').map(Number);
            const [hours, minutes] = manualTime.split(':').map(Number);

            // Create a new date object
            const newDate = new Date(year, month - 1, day, hours, minutes);

            // Check if the date is valid
            if (!isNaN(newDate.getTime())) {
                // Update the selected date
                setSelectedDate(newDate);
                setValue('departureTime', newDate.toISOString());
            }
        } catch (error) {
            console.error('Error parsing manual date/time:', error);
        }
    }, [manualDate, manualTime, setValue]);

    // Automatically set departure station to nearest station when it becomes available
    useEffect(() => {
        if (nearestStation) {
            console.log('Nearest station available, setting departure station:', nearestStation.id);
            setValue('departureStationId', nearestStation.id);
        }
    }, [nearestStation, setValue]);

    // Watch form values
    const departureStationId = watch('departureStationId');
    const arrivalStationId = watch('arrivalStationId');


    const onSubmit = (values: FormValues) => {
        // Get station names for display
        const departureStationName = getDepartureStationName();
        const arrivalStationName = getArrivalStationName();

        // Redirect to connections screen with search parameters
        router.push({
            pathname: '/connections',
            params: {
                startStationId: values.departureStationId,
                endStationId: values.arrivalStationId,
                departureTime: values.departureTime,
                startStationName: departureStationName,
                endStationName: arrivalStationName
            }
        });
    };


    // Function to manually set the departure station to the nearest station
    const useCurrentLocation = () => {
        if (nearestStation) {
            setValue('departureStationId', nearestStation.id);
            console.log('Manually setting departure station to nearest station:', nearestStation.id);
        } else {
            console.log('Nearest station not available yet');
            // The button should be disabled when isLoadingNearestStation is true,
            // so this case should not happen in normal usage
        }
    };

    // Find station names for display
    const getDepartureStationName = () => {
        if (!departureStationId || !stations) return '';
        const station = stations.find(s => s.id === departureStationId);
        return station ? station.name : '';
    };

    const getArrivalStationName = () => {
        if (!arrivalStationId || !stations) return '';
        const station = stations.find(s => s.id === arrivalStationId);
        return station ? station.name : '';
    };

    return (
        <Box className="flex-1 p-4" key={colorModeKey}>
            <VStack space="lg">
                <Heading size="xl">Search Connection</Heading>

                <Text>Departure Station</Text>
                <HStack space="sm" className="items-center">
                    <Box className="flex-1">
                        <Select onValueChange={(v: string) => setValue('departureStationId', v)} selectedValue={departureStationId}>
                            <SelectTrigger variant="outline" size="md" className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
                                <SelectInput placeholder="Select departure station" value={getDepartureStationName()} />
                                <SelectIcon className="mr-3" as={Ionicons} />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent>
                                    <SelectDragIndicatorWrapper>
                                        <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    <SelectScrollView>
                                        {stations?.map((station) => (
                                            <SelectItem
                                                key={station.id}
                                                label={station.name}
                                                value={station.id}
                                            />
                                        ))}
                                    </SelectScrollView>
                                </SelectContent>
                            </SelectPortal>
                        </Select>
                    </Box>
                    <TouchableOpacity onPress={useCurrentLocation} disabled={isLoadingNearestStation}>
                        <Box className="p-2 bg-blue-500 dark:bg-blue-600 rounded">
                            {isLoadingNearestStation ? (
                                <ActivityIndicator size="small" color={colorMode === "dark" ? "#e5e7eb" : "white"} />
                            ) : (
                                <Ionicons name="location" size={24} color={colorMode === "dark" ? "#e5e7eb" : "white"} />
                            )}
                        </Box>
                    </TouchableOpacity>
                </HStack>
                {errors.departureStationId ? (
                    <Text className="text-red-500">{errors.departureStationId.message}</Text>
                ) : null}

                <Text>Arrival Station</Text>
                <Select onValueChange={(v: string) => setValue('arrivalStationId', v)} selectedValue={arrivalStationId}>
                    <SelectTrigger variant="outline" size="md" className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
                        <SelectInput placeholder="Select arrival station" value={getArrivalStationName()} />
                        <SelectIcon className="mr-3" as={Ionicons} />
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                            <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            <SelectScrollView>
                                {stations?.map((station) => (
                                    <SelectItem
                                        key={station.id}
                                        label={station.name}
                                        value={station.id}
                                    />
                                ))}
                            </SelectScrollView>
                        </SelectContent>
                    </SelectPortal>
                </Select>
                {errors.arrivalStationId ? (
                    <Text className="text-red-500">{errors.arrivalStationId.message}</Text>
                ) : null}

                <Text>Departure Date & Time</Text>
                <Box className="mt-2 space-y-2">
                    <Text>Date (YYYY-MM-DD)</Text>
                    <Input className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
                        <InputField
                            value={manualDate}
                            onChangeText={setManualDate}
                            placeholder="YYYY-MM-DD"
                            className="text-black dark:text-white"
                        />
                    </Input>

                    <Text>Time (HH:MM)</Text>
                    <Input className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md">
                        <InputField
                            value={manualTime}
                            onChangeText={setManualTime}
                            placeholder="HH:MM"
                            className="text-black dark:text-white"
                        />
                    </Input>

                </Box>
                {errors.departureTime ? (
                    <Text className="text-red-500">{errors.departureTime.message}</Text>
                ) : null}

                <Button 
                    onPress={handleSubmit(onSubmit)}
                    className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 active:bg-blue-700 dark:active:bg-blue-800 mt-4"
                >
                    <Text className="text-white font-bold">Search</Text>
                </Button>

            </VStack>
        </Box>
    );
}
