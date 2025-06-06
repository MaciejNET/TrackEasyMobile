// This file is kept for backward compatibility
// New code should import from the specific API files

import baseApi from './baseApi';
import authApi from './auth';
import { setAuthToken } from './baseApi';
import ticketApi from './ticket';

// Re-export everything for backward compatibility
export { authApi, ticketApi, setAuthToken };
export default baseApi;
