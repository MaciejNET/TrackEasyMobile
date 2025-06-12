import { useQuery } from '@tanstack/react-query';
import searchApi from '@/services/searchApi';
import { nearestStationSchema } from '@/schemas/station';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useNearestStation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        setLocationError('Error getting location');
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  return useQuery({
    queryKey: ['nearestStation', location?.latitude, location?.longitude],
    queryFn: async () => {
      if (!location) throw new Error('Location not available');
      
      const res = await searchApi.get('/stations/nearest', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      
      const parsed = nearestStationSchema.safeParse(res.data);
      if (!parsed.success) throw new Error('Invalid nearest station data');
      return parsed.data;
    },
    enabled: !!location,
  });
};