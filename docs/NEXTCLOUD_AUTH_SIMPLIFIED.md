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

### Simplified Authentication Flow

1. User enters their Nextcloud username and password on the login page
2. System authenticates directly with the configured Nextcloud server
3. If credentials are valid, system attempts to convert password to app password (if not already)
4. User information and groups are retrieved from Nextcloud
5. User role is determined based on Nextcloud group membership
6. User is logged in and redirected to the dashboard

### Security Features

- Automatic conversion of regular passwords to app passwords when possible
- No passwords are stored in the e-library system beyond the session
- Supports Nextcloud's existing authentication mechanisms
- Group-based role mapping
- Automatic credential cleanup on logout

### Supported Nextcloud Features

- Username/email login
- App password conversion
- Group-based role mapping
- User avatar and display name
- Two-factor authentication (when using app passwords)

## Nextcloud Server Setup

### 1. Group Configuration (Optional)

If you want to use group-based role mapping:

1. Create groups in Nextcloud admin panel:

   - `admin` - for system administrators
   - `editor` - for content editors
   - `user` - for regular users

2. Assign users to appropriate groups

### 2. CORS Configuration (If Needed)

If you encounter CORS issues, you may need to configure your Nextcloud server to allow requests from your e-library domain. Add the following to your Nextcloud config:

```php
'cors.allowed-domains' => [
    'your-e-library-domain.com',
],
```

## Troubleshooting

### Common Issues

1. **Invalid Credentials**: Verify username and password are correct
2. **CORS Errors**: Configure CORS settings on your Nextcloud server
3. **Invalid Server URL**: Verify the Nextcloud server URL is correct and accessible
4. **SSL Certificate Issues**: Ensure your Nextcloud server has a valid SSL certificate

### Error Messages

- **"Connection Error"**: Check if the Nextcloud server URL is correct and accessible
- **"Authentication Failed"**: Verify username and password are correct
- **"Invalid Credentials"**: The authentication completed but credential validation failed

### Debug Mode

To enable debug logging, check the browser console for detailed error messages during the authentication process.

## Security Considerations

1. **HTTPS Required**: Always use HTTPS for both Nextcloud and e-library in production
2. **App Password Management**: Users can view and revoke app passwords in Nextcloud settings
3. **Session Management**: Users are automatically logged out when Nextcloud credentials expire
4. **Role Security**: Role mapping is based on Nextcloud groups at authentication time

## API Endpoints Used

The integration uses the following Nextcloud API endpoints:

- `GET /ocs/v2.php/core/getapppassword` - Convert to app password
- `GET /ocs/v2.php/cloud/user` - Get user information
- `DELETE /ocs/v2.php/core/apppassword` - Delete app password (logout)

## Development

### Testing Locally

1. Set up a local Nextcloud instance or use a development server
2. Update `.env.local` with your test server URL
3. Test the authentication with your Nextcloud credentials

### Fallback Mode

When Nextcloud authentication is disabled (`NEXT_PUBLIC_NEXTCLOUD_ENABLED=false`), the system falls back to mock authentication for development purposes.

### Custom Role Mapping

To implement custom role mapping logic, modify the `getUserRoleFromNextcloudGroups` function in `src/config/nextcloud.ts`.

## Support

For issues related to:

- Nextcloud server configuration → Nextcloud documentation
- E-library integration → Create an issue in this repository
- Authentication flow → Check the error messages in browser console
