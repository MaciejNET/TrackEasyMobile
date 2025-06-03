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

## Features

- User registration
- User login
- JWT token storage
- Protected routes
- Account details display
- Logout functionality
- Form validation with Zod
- Type-safe API requests and responses

## API Endpoints

The app uses the following API endpoints:

- `POST /users/passenger` - Create a new user account
- `POST /users/token` - Login and generate JWT token
- `GET /users/me` - Get current user data
- `GET /tickets/current` - Get the current ticket ID (nullable GUID)

## Usage

1. Start the app with `npm start` or `npx expo start`
2. Press `i` to run on iOS simulator, or scan the QR code with the Expo Go app on your device
3. If not logged in, you'll be redirected to the login screen
4. You can register a new account or login with existing credentials
5. After authentication, you'll see your account details in the Account tab
6. You can logout using the logout button in the Account screen

> Note: This app uses the standard Expo Go client and does not require a development build.
>
> **Important**: The app is configured to use JavaScriptCore (JSC) instead of Hermes to avoid the error: "TypeError: getDevServer is not a function (it is Object), js engine: hermes". If you encounter this error, make sure "jsEngine": "jsc" is set in app.json.

## Implementation Details

- Authentication state is managed through a React Context
- JWT token is securely stored using expo-secure-store
- API requests automatically include the auth token when available
- The useUser hook provides easy access to user data with caching
- The useCurrentTicket hook provides access to the current ticket ID
- Form validation is implemented using Zod schemas

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

## Current Ticket Hook

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
