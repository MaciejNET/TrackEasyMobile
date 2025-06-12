import baseApi from './baseApi';
import { 
  createPassengerCommandSchema, 
  generateTokenCommandSchema, 
  userDtoSchema,
  externalLoginCommandSchema,
  CreatePassengerCommand,
  GenerateTokenCommand,
  ExternalLoginCommand,
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

  // External login
  externalLogin: async (data: ExternalLoginCommand) => {
    try {
      // Log the input data for debugging
      console.log('External login data:', JSON.stringify(data));

      // Ensure date is in YYYY-MM-DD format
      let dateOfBirth = data.dateOfBirth;

      // Try to format the date if it's not already in YYYY-MM-DD format
      if (!dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log('Date of birth is not in YYYY-MM-DD format, attempting to format...');

        // Try to parse as MM/DD/YYYY
        const mmddyyyyMatch = dateOfBirth.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (mmddyyyyMatch) {
          const [_, month, day, year] = mmddyyyyMatch;
          dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          console.log('Formatted from MM/DD/YYYY to YYYY-MM-DD:', dateOfBirth);
        } else {
          // Try to parse as DD/MM/YYYY
          const ddmmyyyyMatch = dateOfBirth.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (ddmmyyyyMatch) {
            const [_, day, month, year] = ddmmyyyyMatch;
            dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            console.log('Formatted from DD/MM/YYYY to YYYY-MM-DD:', dateOfBirth);
          } else {
            // Try to parse as a Date object
            try {
              const date = new Date(dateOfBirth);
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dateOfBirth = `${year}-${month}-${day}`;
                console.log('Formatted from Date object to YYYY-MM-DD:', dateOfBirth);
              } else {
                console.error('Could not parse date of birth as a Date object');
              }
            } catch (dateError) {
              console.error('Error parsing date of birth:', dateError);
            }
          }
        }
      }

      // Create a new data object with the formatted date
      const formattedData = {
        ...data,
        dateOfBirth
      };

      // Validate data with Zod schema
      const validationResult = externalLoginCommandSchema.safeParse(formattedData);

      if (!validationResult.success) {
        console.error('Validation error:', validationResult.error);
        throw new Error(validationResult.error.errors[0]?.message || 'Invalid external login data');
      }

      console.log('Formatted date of birth:', dateOfBirth);

      // Construct the URL for the WebView
      const url = `${baseApi.defaults.baseURL}/users/external/${formattedData.provider}?firstName=${encodeURIComponent(formattedData.firstName)}&lastName=${encodeURIComponent(formattedData.lastName)}&dateOfBirth=${encodeURIComponent(dateOfBirth)}`;

      console.log('Generated URL for WebView:', url);

      return url;
    } catch (error: any) {
      console.error('External login failed:', error);
      console.error('Error details:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  // Handle external login callback
  handleExternalLoginCallback: async (provider: string) => {
    try {
      // Log the provider
      console.log('Handling external login callback for provider:', provider);

      // Validate provider
      if (!provider || (provider !== 'google' && provider !== 'microsoft')) {
        console.error('Invalid provider:', provider);
        throw new Error(`Invalid provider: ${provider}. Must be 'google' or 'microsoft'.`);
      }

      // Log the URL
      console.log(`Making request to: /users/external/${provider}/callback`);

      // Make the request with timeout
      const response = await baseApi.get(`/users/external/${provider}/callback`, {
        timeout: 10000 // 10 second timeout
      });

      // Log the response
      console.log('External login callback response status:', response.status);
      console.log('External login callback response data:', response.data);

      // Validate response data
      if (!response.data) {
        console.error('Empty response data from callback');
        throw new Error('Empty response data from callback');
      }

      return response.data;
    } catch (error: any) {
      console.error('External login callback failed:', error);
      console.error('Error details:', error.message);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);

        // Provide more specific error messages based on status code
        if (error.response.status === 400) {
          throw new Error('Bad request: The server could not understand the request.');
        } else if (error.response.status === 401) {
          throw new Error('Unauthorized: Authentication is required and has failed.');
        } else if (error.response.status === 403) {
          throw new Error('Forbidden: You do not have permission to access this resource.');
        } else if (error.response.status === 404) {
          throw new Error('Not found: The requested resource could not be found.');
        } else if (error.response.status === 500) {
          throw new Error('Server error: The server encountered an unexpected condition.');
        }
      }

      // If we get here, it's a network error or some other error
      throw new Error(`External login callback failed: ${error.message}`);
    }
  },

  // Update user data
  updateUser: async (userId: string, userData: { firstName: string; lastName: string; dateOfBirth: string }) => {
    try {
      const response = await baseApi.patch(`/users/${userId}/update`, {
        id: userId,
        ...userData
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update user data:', error);
      throw error;
    }
  },
};

export default authApi;
