import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useConnectionsQuery } from '@/hooks/useConnectionsQuery';
import { FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HStack } from '@/components/ui/hstack';

// Map backend numeric currency enum to human-readable code
const currencyCodeFromEnum = (code: number | string | undefined | null): 'PLN' | 'EUR' | 'USD' | '' => {
    if (code === null || code === undefined) return '';
    if (typeof code === 'string') {
        // if backend already returns string, normalize and validate
        if (code === 'PLN' || code === 'EUR' || code === 'USD') return code;
        // attempt to parse numeric string
        const n = Number(code);
        if (!Number.isNaN(n)) code = n as unknown as number;
        else return '';
    }
    switch (code as number) {
        case 0: return 'PLN';
        case 1: return 'EUR';
        case 2: return 'USD';
        default: return '';
    }
};


const formatDateTime = (dateString: string): string => {
    if (!dateString) return 'N/A';

    try {
        
        const date = new Date(dateString);

        
        if (!isNaN(date.getTime())) {
            return date.toLocaleString();
        }

        
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateString)) {
            return dateString;
        }

        
        return dateString;
    } catch (error) {
        
        return dateString;
    }
};


const formatTime = (timeString: string): string => {
    if (!timeString) return 'N/A';

    try {
        
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
            
            return timeString.substring(0, 5);
        }

        
        const date = new Date(timeString);

        
        if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        
        return timeString;
    } catch (error) {
        
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

    
    const searchParams = {
        startStationId: params.startStationId || '',
        endStationId: params.endStationId || '',
        departureTime: params.departureTime || '',
    };

    
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
                    <Box className="w-[50px]" /> {}
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
                                                <Text className="font-bold">{typeof connection?.price === 'object' && connection?.price !== null ? `${Number(connection.price.amount).toFixed(2)} ${currencyCodeFromEnum(connection.price.currency)}` : `$${Number(connection?.price ?? 0).toFixed(2)}`}</Text>
                                            </HStack>
                                        </Box>
                                    )) || <Text className="mt-2 italic">No connection details available</Text>}

                                    <Button 
                                        onPress={() => {
                                            
                                            const formatToYYYYMMDD = (dateString: string): string => {
                                                if (!dateString) return new Date().toISOString().split('T')[0];

                                                
                                                if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                                                    return dateString;
                                                }

                                                
                                                if (dateString.includes('T')) {
                                                    return dateString.split('T')[0];
                                                }

                                                
                                                if (dateString.includes(' ')) {
                                                    const datePart = dateString.split(' ')[0];
                                                    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
                                                        return datePart;
                                                    }
                                                }

                                                
                                                const date = new Date(dateString);
                                                if (!isNaN(date.getTime())) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    return `${year}-${month}-${day}`;
                                                }

                                                
                                                return new Date().toISOString().split('T')[0];
                                            };

                                            
                                            const connectionDate = formatToYYYYMMDD(item?.departureTime || '');

                                            
                                            const connections = item?.connections?.map((connection: any) => ({
                                                id: connection.id,
                                                startStationId: connection.departureStationId,
                                                endStationId: connection.arrivalStationId,
                                                connectionDate: connectionDate
                                            })) || [];

                                            
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
