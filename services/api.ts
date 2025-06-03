import axios from 'axios';
import { 
  createPassengerCommandSchema, 
  generateTokenCommandSchema, 
  userDtoSchema,
  CreatePassengerCommand,
  GenerateTokenCommand,
  UserDto
} from '@/schemas/auth';
import { ticketIdSchema, TicketId } from '@/schemas/ticket';

// Base API configuration
const API_URL = 'https://trackeasy-api-axaaadhhapfvg8cx.polandcentral-01.azurewebsites.net';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const authApi = {
  // Register a new passenger
  register: async (userData: CreatePassengerCommand) => {
    try {
      // Validate userData with Zod schema
      const validationResult = createPassengerCommandSchema.safeParse(userData);

      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid user data');
      }

      const response = await api.post('/users/passenger', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login and get token
  login: async (credentials: GenerateTokenCommand) => {
    try {
      // Validate credentials with Zod schema
      const validationResult = generateTokenCommandSchema.safeParse(credentials);

      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid credentials');
      }

      const response = await api.post<string>('/users/token', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user data
  getCurrentUser: async (token: string) => {
    try {
      const response = await api.get<UserDto>('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Validate response data with Zod schema
      const validationResult = userDtoSchema.safeParse(response.data);

      if (!validationResult.success) {
        console.error('User data validation failed:', validationResult.error);
        throw new Error('Invalid user data received from server');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Ticket API functions
export const ticketApi = {
  // Get current ticket ID
  getCurrentTicket: async () => {
    try {
      const response = await api.get<TicketId>('/tickets/current');

      // Validate response data with Zod schema
      const validationResult = ticketIdSchema.safeParse(response.data);

      if (!validationResult.success) {
        console.error('Ticket data validation failed:', validationResult.error);
        throw new Error('Invalid ticket data received from server');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Function to set auth token for all future requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
