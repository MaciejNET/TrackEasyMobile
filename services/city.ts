import baseApi from './baseApi';
import { 
  ticketCityListSchema, 
  cityDetailsSchema, 
  ticketArrivalListSchema,
  TicketCity, 
  CityDetails,
  TicketArrival
} from '@/schemas/city';

const cityApi = {
  getTicketCities: async (ticketId: string): Promise<TicketCity[]> => {
    try {
      const response = await baseApi.get(`/tickets/${ticketId}/cities`);
      const parsed = ticketCityListSchema.safeParse(response.data);

      if (!parsed.success) {
        console.error('Invalid ticket cities data:', parsed.error);
        throw new Error('Invalid ticket cities data');
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to fetch ticket cities:', error);
      throw error;
    }
  },

  getCityDetails: async (cityId: string): Promise<CityDetails> => {
    try {
      const response = await baseApi.get(`/cities/${cityId}`);
      const data = response.data;
      if (data && data.country && typeof data.country.id === 'number') {
        data.country.id = String(data.country.id);
      }

      const parsed = cityDetailsSchema.safeParse(data);

      if (!parsed.success) {
        console.error('Invalid city details data:', parsed.error);
        throw new Error('Invalid city details data');
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to fetch city details:', error);
      throw error;
    }
  },

  getTicketArrivals: async (ticketId: string): Promise<TicketArrival[]> => {
    try {
      const response = await baseApi.get(`/tickets/${ticketId}/arrivals`);
      const parsed = ticketArrivalListSchema.safeParse(response.data);

      if (!parsed.success) {
        console.error('Invalid ticket arrivals data:', parsed.error);
        throw new Error('Invalid ticket arrivals data');
      }

      return parsed.data;
    } catch (error) {
      console.error('Failed to fetch ticket arrivals:', error);
      throw error;
    }
  }
};

export default cityApi;
