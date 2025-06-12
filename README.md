# Track Easy Mobile

## Authentication Implementation

This project includes a complete authentication system with login and registration functionality. The implementation uses:

- Gluestack UI for components
- Tailwind CSS for styling
- Expo Router for navigation
- React Query for data fetching
- Axios for API requests
- Expo Secure Store for token storage
- Zod for data validation
- React Hook Form for form handling

## Dependencies

All required dependencies are included in the package.json file. Just run `npm install` to install them.

For the search functionality, you'll need to install these additional dependencies:

```bash
npm install @react-native-community/datetimepicker expo-location
```

## Features

- User registration
- User login
- JWT token storage
- Protected routes
- Account details display
- Logout functionality
- Form validation with Zod
- Type-safe API requests and responses
- Search for train connections (no login required)
- Geolocation for finding nearest station
- Date picker for selecting departure date
- Pagination for search results

## API Endpoints

The app uses the following API endpoints:

### Authentication and User Endpoints
- `POST /users/passenger` - Create a new user account
- `POST /users/token` - Login and generate JWT token
- `GET /users/me` - Get current user data
- `GET /tickets/current` - Get the current ticket ID (nullable GUID)

### Search Endpoints (No Authentication Required)
- `GET /system-lists/stations` - Get list of all stations
- `GET /stations/nearest?latitude={value}&longitude={value}` - Get nearest station based on geolocation
- `GET /connections?startStationId={id}&endStationId={id}&departureTime={datetime}` - Search for connections
  - Supports pagination with nextCursor parameter

## Usage

1. Start the app with `npm start` or `npx expo start`
2. Press `i` to run on iOS simulator, or scan the QR code with the Expo Go app on your device
3. If not logged in, you'll be redirected to the login screen for account-related features
4. You can register a new account or login with existing credentials
5. After authentication, you'll see your account details in the Account tab
6. You can logout using the logout button in the Account screen

### Using the Search Feature (No Login Required)

1. Navigate to the Search tab
2. Select a departure station from the dropdown or use the location button to find the nearest station
3. Select an arrival station from the dropdown
4. Select a departure date using the date picker
5. Click the Search button to find available connections
6. View the results and use the "Load more" button for pagination if available

> Note: This app uses the standard Expo Go client and does not require a development build.
>
> **Important**: The app is configured to use JavaScriptCore (JSC) instead of Hermes to avoid the error: "TypeError: getDevServer is not a function (it is Object), js engine: hermes". If you encounter this error, make sure "jsEngine": "jsc" is set in app.json.

## Implementation Details

### Authentication
- Authentication state is managed through a React Context
- JWT token is securely stored using expo-secure-store
- API requests automatically include the auth token when available
- The useUser hook provides easy access to user data with caching
- The useCurrentTicket hook provides access to the current ticket ID
- Form validation is implemented using Zod schemas

### Search Functionality
- Search feature works without requiring authentication
- Uses a separate API service (searchApi) that doesn't include authentication headers
- Geolocation is implemented using expo-location
- Date selection uses @react-native-community/datetimepicker
- Search results support pagination with "Load more" functionality
- Connection data is validated using Zod schemas

## Form Validation with Zod

This project uses Zod for data validation:

- Zod schemas are defined in `schemas/auth.ts`
- Login and registration forms use Zod for validation
- API requests and responses are validated with Zod
- Type safety is ensured with TypeScript integration

For better integration with react-hook-form, it's recommended to install the @hookform/resolvers package:

```bash
npm install @hookform/resolvers
```

Then update the useForm hook in login and register screens:

```typescript
import { zodResolver } from '@hookform/resolvers/zod';

const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: '',
    password: '',
  },
});
```

## Custom Hooks

### Current Ticket Hook

The app includes a hook for accessing the current ticket ID:

```typescript
import { useCurrentTicket } from '@/hooks/useCurrentTicket';

function MyComponent() {
  const { currentTicketId, isLoading, error, refetch } = useCurrentTicket();

  // Use currentTicketId in your component
  // isLoading - boolean indicating if the ticket is being fetched
  // error - any error that occurred during fetching
  // refetch - function to manually refetch the ticket ID
}
```

The hook automatically fetches the current ticket ID when the component mounts and caches the result for 5 minutes. It also handles authentication, only fetching the ticket ID if the user is authenticated.

### Search Hooks

The app includes several hooks for the search functionality:

#### Station List Hook

```typescript
import { useStationsQuery } from '@/hooks/useStationsQuery';

function MyComponent() {
  const { data: stations, isLoading, error } = useStationsQuery();

  // stations - array of station objects with id and name
  // isLoading - boolean indicating if stations are being fetched
  // error - any error that occurred during fetching
}
```

#### Nearest Station Hook

```typescript
import { useNearestStation } from '@/hooks/useNearestStation';

function MyComponent() {
  const { data: nearestStation, isLoading, error } = useNearestStation();

  // nearestStation - object with id, name, and city
  // isLoading - boolean indicating if the nearest station is being fetched
  // error - any error that occurred during fetching
}
```

This hook automatically requests location permissions and fetches the user's current location.

#### Connections Search Hook

```typescript
import { useConnectionsQuery } from '@/hooks/useConnectionsQuery';

function MyComponent() {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetching 
  } = useConnectionsQuery({
    startStationId: 'departure-station-id',
    endStationId: 'arrival-station-id',
    departureTime: '2023-06-10T12:30:00Z'
  });

  // data - connection results with pagination info
  // fetchNextPage - function to load the next page of results
  // hasNextPage - boolean indicating if there are more results
  // isFetching - boolean indicating if data is being fetched
}
```

This hook supports pagination and will only fetch data when all required parameters are provided.

## Package Compatibility

This project has been updated to use the following package versions for best compatibility with Expo 53:

- expo-blur: ~14.1.4
- expo-constants: ~17.1.6
- expo-font: ~13.3.1
- expo-haptics: ~14.1.4
- expo-linking: ~7.1.5
- expo-router: ~5.0.7
- expo-splash-screen: ~0.30.8
- expo-secure-store: ~12.8.1
- expo-status-bar: ~2.2.3
- expo-symbols: ~0.4.4
- expo-system-ui: ~5.0.7
- expo-web-browser: ~14.1.6
- react-dom: 19.0.0
- react-native-gesture-handler: ~2.24.0
- react-native-reanimated: ~3.17.4
- react-native-screens: ~4.11.1
- react-native-web: ^0.20.0
- @types/react: ~19.0.10
- jest-expo: ~53.0.5
