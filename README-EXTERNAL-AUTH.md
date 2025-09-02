# External Authentication Implementation

This document provides an overview of the external authentication implementation for Google and Microsoft login/register functionality.

## Overview

The implementation allows users to sign in or register using their Google or Microsoft accounts. The flow is as follows:

1. User clicks on the Google or Microsoft button on the login screen
2. User is prompted to enter their first name, last name, and date of birth
3. User is redirected to the external provider for authentication
4. After authentication, the backend returns a token to the callback page
5. The WebView captures the token and the app completes the authentication process before redirecting the user to the home screen

## Files Modified/Created

- `schemas/auth.ts`: Added schemas for external authentication
- `contexts/AuthContext.tsx`: Added methods for external authentication
- `services/auth.ts`: Added methods for external authentication
- `app/auth/login.tsx`: Added UI components for Google and Microsoft login buttons
- `app/auth/external-login.tsx`: Created screen for collecting user details for external authentication
- `app/auth/WebViewAuth.tsx`: Updated to read the token directly from the callback page
- `app/auth/external-callback.tsx`: Screen for handling a token-based deep link callback

## Backend Integration

The implementation integrates with the following backend endpoints:

- `GET /users/external/{provider}`: Initiates external login with the specified provider
- `GET /users/external/{provider}/callback`: Handles the callback from the external provider

## Testing

To test the implementation:

1. Run the app
2. Navigate to the login screen
3. Click on the Google or Microsoft button
4. Enter your first name, last name, and date of birth
5. Click "Continue with Google/Microsoft"
6. You should be redirected to the external provider for authentication
7. After authentication, you should be redirected back to the app
8. The app should complete the authentication process and redirect you to the home screen

## Notes

- The implementation assumes that the backend is properly configured to handle external authentication
- The implementation handles the redirect flow, but in a real app, you would need to handle deep linking to properly handle the redirect back to the app
- The implementation collects first name, last name, and date of birth as required by the backend
- The implementation uses the existing authentication context and API services to integrate with the backend

## Future Improvements

- Add support for more external providers
- Improve error handling
- Add more robust validation for user input
- Add support for deep linking to handle the redirect back to the app