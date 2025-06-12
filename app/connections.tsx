import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useConnectionsQuery } from '@/hooks/useConnectionsQuery';
import { FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HStack } from '@/components/ui/hstack';

// Format date and time for display
const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';

    try {
        // Try to parse the date
        const date = new Date(dateString);

        // Check if date is valid
        if (!isNaN(date.getTime())) {
            return date.toLocaleString();
        }

        // If it's just a time string (HH:MM:SS)
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateString)) {
            return dateString;
        }

        // Return the original string if we can't parse it
        return dateString;
    } catch (error) {
        // If any error occurs, return the original string
        return dateString;
    }
};

// Format time only (HH:MM)
const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';

    try {
        // If it's just a time string (HH:MM:SS)
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
            // Return just HH:MM
            return timeString.substring(0, 5);
        }

        // Try to parse as date
        const date = new Date(timeString);

        // Check if date is valid
        if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Return the original string if we can't parse it
        return timeString;
    } catch (error) {
        // If any error occurs, return the original string
        return timeString;
    }
};

export default function ConnectionsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        startStationId: string;
        endStationId: string;
        departureTime: string;
        startStationName: string;
        endStationName: string;
    }>();

    // Extract search parameters from URL
    const searchParams = {
        startStationId: params.startStationId || '',
        endStationId: params.endStationId || '',
        departureTime: params.departureTime || '',
    };

    // Get station names for display
    const startStationName = params.startStationName || '';
    const endStationName = params.endStationName || '';

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isError,
        error,
        isLoading,
    } = useConnectionsQuery(searchParams);

    // Go back to search screen
    const handleBackPress = () => {
        router.back();
    };

    return (
        <Box className="flex-1 p-4">
            <VStack space="lg">
                <HStack className="justify-between mb-2">
                    <Button 
                        onPress={handleBackPress} 
                        variant="outline" 
                        size="sm"
                        className="border border-blue-500 dark:border-blue-400"
                    >
                        <Text className="text-blue-500 dark:text-blue-400">← Back</Text>
                    </Button>
                    <Heading size="lg">Connections</Heading>
                    <Box className="w-[50px]" /> {/* Empty box for alignment */}
                </HStack>

                <Box className="mb-4">
                    <Text className="font-bold text-lg">{startStationName} → {endStationName}</Text>
                    <Text>Departure: {formatDateTime(searchParams.departureTime)}</Text>
                </Box>

                {hasNextPage && !isFetching ? (
                    <Button 
                        onPress={() => fetchNextPage()} 
                        variant="outline" 
                        size="sm"
                        className="border border-blue-500 dark:border-blue-400 mb-2"
                    >
                        <Text className="text-blue-500 dark:text-blue-400">Load More</Text>
                    </Button>
                ) : null}

                {isLoading ? (
                    <Box className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text className="mt-4">Loading connections...</Text>
                    </Box>
                ) : isError ? (
                    <Box className="flex-1 justify-center items-center">
                        <Text className="text-red-500">Error loading connections</Text>
                        <Text className="text-sm mt-2">{error?.message || 'Unknown error'}</Text>
                    </Box>
                ) : data?.pages && Array.isArray(data.pages) && data.pages.length > 0 && data.pages[0]?.items?.length > 0 ? (
                    <>
                        <FlatList
                            data={data.pages.flatMap(page => page?.items || [])}
                            keyExtractor={(item, index) => `${item?.startStation || 'unknown'}-${item?.endStation || 'unknown'}-${index}`}
                            renderItem={({ item }) => (
                                <Box className="border border-gray-300 dark:border-gray-700 p-3 my-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                                    <HStack className="justify-between mb-1">
                                        <Text className="font-bold">{item?.startStation || 'Unknown'} → {item?.endStation || 'Unknown'}</Text>
                                        <Text>Transfers: {item?.transfersCount ?? 0}</Text>
                                    </HStack>
                                    <Text>{formatTime(item?.departureTime || '')} - {formatTime(item?.arrivalTime || '')}</Text>
                                    <Text>Travel time: {item?.totalDuration || 'N/A'}</Text>

                                    {item?.connections?.map((connection: any, idx: any) => (
                                        <Box key={`${connection?.id}-${idx}`} className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded shadow-xs">
                                            <Text className="font-semibold">{idx + 1}. {connection?.name || 'Unknown'}</Text>
                                            <Text>{connection?.departureStation || 'Unknown'} → {connection?.arrivalStation || 'Unknown'}</Text>
                                            <Text>{formatTime(connection?.departureTime || '')} - {formatTime(connection?.arrivalTime || '')}</Text>
                                            <HStack className="justify-between">
                                                <Text>Duration: {connection?.duration || 'N/A'}</Text>
                                                <Text className="font-bold">${connection?.price ?? 0}</Text>
                                            </HStack>
                                        </Box>
                                    )) || <Text className="mt-2 italic">No connection details available</Text>}

                                    <Button 
                                        onPress={() => {
                                            // Format date to YYYY-MM-DD
                                            const formatToYYYYMMDD = (dateString: string): string => {
                                                if (!dateString) return new Date().toISOString().split('T')[0];

                                                // If already in YYYY-MM-DD format, return as is
                                                if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                                                    return dateString;
                                                }

                                                // Try to extract date part from ISO format
                                                if (dateString.includes('T')) {
                                                    return dateString.split('T')[0];
                                                }

                                                // Try to extract date part from space-separated format
                                                if (dateString.includes(' ')) {
                                                    const datePart = dateString.split(' ')[0];
                                                    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
                                                        return datePart;
                                                    }
                                                }

                                                // Try to parse the date
                                                const date = new Date(dateString);
                                                if (!isNaN(date.getTime())) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    return `${year}-${month}-${day}`;
                                                }

                                                // Default to current date if all else fails
                                                return new Date().toISOString().split('T')[0];
                                            };

                                            // Extract connection date from departureTime (YYYY-MM-DD)
                                            const connectionDate = formatToYYYYMMDD(item?.departureTime || '');

                                            // Prepare connection data for ticket purchase
                                            const connections = item?.connections?.map(connection => ({
                                                id: connection.id,
                                                startStationId: connection.departureStationId,
                                                endStationId: connection.arrivalStationId,
                                                connectionDate: connectionDate
                                            })) || [];

                                            // Navigate to buy ticket screen with connection data
                                            router.push({
                                                pathname: '/buy-ticket',
                                                params: {
                                                    connections: JSON.stringify(connections),
                                                    startStation: item?.startStation || '',
                                                    endStation: item?.endStation || '',
                                                    departureTime: item?.departureTime || '',
                                                    arrivalTime: item?.arrivalTime || ''
                                                }
                                            });
                                        }}
                                        className="mt-3 bg-green-600 dark:bg-green-700"
                                    >
                                        <Text className="text-white font-semibold">Buy Ticket</Text>
                                    </Button>
                                </Box>
                            )}
                        />
                    </>
                ) : (
                    <Box className="flex-1 justify-center items-center">
                        <Text className="text-lg font-semibold">No connections found</Text>
                        <Text className="text-sm mt-2">Try different search parameters</Text>

                        {/* Show search parameters for debugging */}
                        <Box className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Text className="font-bold mb-2">Search Parameters:</Text>
                            <Text>From: {startStationName || searchParams.startStationId}</Text>
                            <Text>To: {endStationName || searchParams.endStationId}</Text>
                            <Text>Departure: {formatDateTime(searchParams.departureTime)}</Text>
                        </Box>
                    </Box>
                )}

                {isFetching ? (
                    <Box className="py-4 flex items-center justify-center">
                        <ActivityIndicator size="large" color="#3b82f6" />
                    </Box>
                ) : null}
            </VStack>
        </Box>
    );
}
