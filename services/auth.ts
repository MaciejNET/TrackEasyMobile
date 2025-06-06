import baseApi from './baseApi';
import { 
  createPassengerCommandSchema, 
  generateTokenCommandSchema, 
  userDtoSchema,
  CreatePassengerCommand,
  GenerateTokenCommand,
  UserDto
} from '@/schemas/auth';

// Auth API functions
export const authApi = {
  // Register a new passenger
  register: async (userData: CreatePassengerCommand) => {
    try {
      // Validate userData with Zod schema
      const validationResult = createPassengerCommandSchema.safeParse(userData);

      if (!validationResult.success) {
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid user data');
      }

      const response = await baseApi.post('/users/passenger', userData);
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

      const response = await baseApi.post<string>('/users/token', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user data
  getCurrentUser: async (token?: string) => {
    try {
      // If token is provided, use it directly in the request
      // Otherwise, the baseApi interceptor will handle it
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      
      const response = await baseApi.get<UserDto>('/users/me', config);

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

export default authApi;