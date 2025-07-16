# Nextcloud Authentication Setup

This document explains how to configure Nextcloud authentication for the E-Library Document Management System.

## Prerequisites

1. A running Nextcloud server
2. Admin access to the Nextcloud server
3. Your Nextcloud server should be accessible via HTTPS (recommended)

## Configuration

### 1. Environment Variables

Copy `.env.example` to `.env.local` and update the following variables:

```bash
# Your Nextcloud server URL (required)
NEXT_PUBLIC_NEXTCLOUD_SERVER_URL=https://your-nextcloud-server.com

# Whether to allow users to enter custom server URLs (optional, default: true)
NEXT_PUBLIC_NEXTCLOUD_ALLOW_CUSTOM_URL=true

# User agent for API requests (optional)
NEXT_PUBLIC_NEXTCLOUD_USER_AGENT=E-Library-DMS/1.0

# Whether Nextcloud authentication is enabled (optional, default: true)
NEXT_PUBLIC_NEXTCLOUD_ENABLED=true
```

### 2. Role Mapping

By default, the system maps Nextcloud groups to e-library roles as follows:

- `admin` group → `admin` role
- `editor` group → `editor` role
- `user` group → `user` role
- Users not in any mapped group → `user` role (default)

You can customize this mapping in `src/config/nextcloud.ts`.

## How It Works

### Authentication Flow

1. User clicks "Sign in with Nextcloud" on the login page
2. User enters their Nextcloud server URL (if custom URLs are allowed)
3. System initiates Nextcloud Login Flow v2
4. A new browser window opens to the Nextcloud login page
5. User authenticates with their Nextcloud credentials
6. System polls for authentication completion
7. Once authenticated, user information is retrieved and stored
8. User is redirected to the dashboard

### Security Features

- Uses Nextcloud Login Flow v2 for secure authentication
- No passwords are stored in the e-library system
- Each authentication creates a unique app password in Nextcloud
- App passwords can be revoked from Nextcloud settings
- Supports Nextcloud's two-factor authentication

### Supported Nextcloud Features

- Username/email login
- Two-factor authentication
- App passwords
- Group-based role mapping
- User avatar and display name
- Automatic credential cleanup on logout

## Nextcloud Server Setup

### 1. Enable Login Flow

The Login Flow is enabled by default in modern Nextcloud installations. No additional configuration is typically required.

### 2. Group Configuration (Optional)

If you want to use group-based role mapping:

1. Create groups in Nextcloud admin panel:

   - `admin` - for system administrators
   - `editor` - for content editors
   - `user` - for regular users

2. Assign users to appropriate groups

### 3. CORS Configuration (If Needed)

If you encounter CORS issues, you may need to configure your Nextcloud server to allow requests from your e-library domain. Add the following to your Nextcloud config:

```php
'cors.allowed-domains' => [
    'your-e-library-domain.com',
],
```

## Troubleshooting

### Common Issues

1. **Popup Blocked**: Ensure popup blockers allow the authentication window
2. **CORS Errors**: Configure CORS settings on your Nextcloud server
3. **Invalid Server URL**: Verify the Nextcloud server URL is correct and accessible
4. **SSL Certificate Issues**: Ensure your Nextcloud server has a valid SSL certificate

### Error Messages

- **"Connection Error"**: Check if the Nextcloud server URL is correct and accessible
- **"Authentication Timeout"**: The authentication process took too long (20 minutes limit)
- **"Invalid Credentials"**: The authentication completed but credential validation failed
- **"Popup Blocked"**: Browser blocked the authentication popup window

### Debug Mode

To enable debug logging, check the browser console for detailed error messages during the authentication process.

## Security Considerations

1. **HTTPS Required**: Always use HTTPS for both Nextcloud and e-library in production
2. **App Password Management**: Users can view and revoke app passwords in Nextcloud settings
3. **Session Management**: Users are automatically logged out when Nextcloud credentials expire
4. **Role Security**: Role mapping is based on Nextcloud groups at authentication time

## API Endpoints Used

The integration uses the following Nextcloud API endpoints:

- `POST /index.php/login/v2` - Initiate login flow
- `POST /login/v2/poll` - Poll for authentication completion
- `GET /ocs/v2.php/cloud/user` - Get user information
- `DELETE /ocs/v2.php/core/apppassword` - Delete app password (logout)

## Development

### Testing Locally

1. Set up a local Nextcloud instance or use a development server
2. Update `.env.local` with your test server URL
3. Test the authentication flow in your development environment

### Custom Role Mapping

To implement custom role mapping logic, modify the `getUserRoleFromNextcloudGroups` function in `src/config/nextcloud.ts`.

## Support

For issues related to:

- Nextcloud server configuration → Nextcloud documentation
- E-library integration → Create an issue in this repository
- Authentication flow → Check the Nextcloud Login Flow documentation
