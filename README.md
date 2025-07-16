# E-Library Document Management System (DMS)

A comprehensive Document Management System built with Next.js, featuring role-based access control, file upload/download, search functionality, and a modern Material-UI interface.

## 🚀 Features

### Core Functionality

- **Role-Based Authentication** - Admin, Editor, User, and Guest roles with different permissions
- **File Management** - Upload, download, view, organize files in folders
- **Search & Filter** - Global search with advanced filtering by file type, tags, date, etc.
- **File Preview** - In-browser preview for PDFs, images, videos, and audio files
- **Public File Access** - Public files accessible without authentication
- **User Management** - Admin panel for managing users and permissions

### User Interface

- **Modern Material-UI Design** - Clean, responsive interface
- **Dashboard Analytics** - File statistics, recent activity, popular downloads
- **Grid/List Views** - Toggle between different file browser layouts
- **Real-time Notifications** - Upload progress, system notifications
- **Mobile Responsive** - Works seamlessly on all devices

### Security & Permissions

- **Role-Based Access Control (RBAC)** - Granular permissions system
- **Session Management** - Secure authentication with session monitoring
- **File Security** - Private/public file access controls
- **Audit Logging** - Track user activities and file operations

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **State Management**: Zustand
- **Authentication**: Custom context-based auth system
- **File Storage**: Extensible (filesystem, S3, etc.)
- **Styling**: Material-UI theme system

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Authentication page
│   └── public-files/     # Public file access
├── components/           # Reusable UI components
│   ├── layout/          # Layout components
│   ├── files/           # File-specific components
│   └── other/           # Utility components
├── contexts/            # React contexts (Auth, etc.)
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles and themes
```

## 📱 Pages & Routes

| Route                    | Description                                    | Access Level  |
| ------------------------ | ---------------------------------------------- | ------------- |
| `/`                      | Landing page (redirects to dashboard or login) | Public        |
| `/login`                 | Authentication page                            | Public        |
| `/dashboard`             | Main dashboard with analytics                  | Authenticated |
| `/dashboard/files`       | File browser with folder navigation            | Authenticated |
| `/dashboard/upload`      | File upload interface                          | User+         |
| `/dashboard/search`      | Advanced search and filtering                  | Authenticated |
| `/dashboard/admin/users` | User management panel                          | Admin only    |
| `/dashboard/settings`    | User profile and preferences                   | Authenticated |
| `/public-files`          | Public file access (no auth required)          | Public        |

## 🔐 User Roles & Permissions

### Admin

- Full system access
- Manage users and roles
- System configuration
- Access all files and folders
- View audit logs and analytics

### Editor

- Upload and manage files
- Approve content
- Create and organize folders
- Moderate public content

### User

- Upload and download files
- Create personal folders
- Share files with others
- Access assigned content

### Guest

- View public files only
- Download public content
- Limited search capabilities

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd e-library
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Environment Variables

```env
# Database Configuration
DATABASE_URL="your-database-url"

# File Storage Configuration
STORAGE_TYPE="filesystem" # or "s3"
UPLOAD_PATH="/uploads"
MAX_FILE_SIZE="10MB"

# Authentication
JWT_SECRET="your-jwt-secret"
SESSION_TIMEOUT="24h"

# External Services (optional)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="your-s3-bucket"
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks

# Husky & Git Hooks
npm run prepare      # Set up git hooks
```

### Code Quality

- **ESLint** - Code linting with Next.js configuration
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Husky** - Pre-commit hooks for code quality

### Adding New Features

1. **Create types** in `src/types/` for new data structures
2. **Add API routes** in `src/app/api/` for backend functionality
3. **Create components** in `src/components/` for UI elements
4. **Add pages** in `src/app/` following the App Router convention
5. **Update permissions** in the auth context if needed

## 📦 File Upload & Storage

### Supported File Types

- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Videos**: MP4, AVI, MOV, WMV
- **Audio**: MP3, WAV, OGG
- **Archives**: ZIP, RAR, 7Z

### Storage Options

- **Filesystem**: Local file storage (default)
- **AWS S3**: Cloud storage with CDN support
- **Custom**: Implement your own storage adapter

### File Processing

- Automatic thumbnail generation for images
- PDF preview generation
- Metadata extraction
- Virus scanning (configurable)

## 🔍 Search & Filtering

### Search Features

- **Full-text search** across file names and descriptions
- **Tag-based filtering** with auto-complete
- **File type filtering** (documents, images, videos, etc.)
- **Date range filtering** (today, week, month, year)
- **Size-based filtering** with range sliders
- **Folder-scoped search** within specific directories

### Advanced Search

- Boolean operators (AND, OR, NOT)
- Wildcard matching
- Exact phrase matching
- Custom metadata fields

## 🎨 Customization

### Theming

The application uses Material-UI's theming system. Customize colors, typography, and spacing in `src/styles/theme.ts`:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Customize primary color
    },
    secondary: {
      main: "#dc004e", // Customize secondary color
    },
  },
  // ... other theme options
});
```

### Adding New File Types

1. Update the `FileMetadata` type in `src/types/dms.ts`
2. Add MIME type handling in file preview component
3. Update upload validation in API routes
4. Add appropriate icons and preview logic

### Custom Permissions

Extend the permission system by:

1. Adding new permission types in `src/types/dms.ts`
2. Updating role definitions in `src/contexts/AuthContext.tsx`
3. Adding permission checks in components and API routes

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### AWS/Digital Ocean

- Use PM2 for process management
- Set up reverse proxy with Nginx
- Configure SSL certificates
- Set up database and file storage

## 📊 Monitoring & Analytics

### Built-in Analytics

- File upload/download statistics
- User activity tracking
- Storage usage monitoring
- Popular content identification

### Integration Options

- Google Analytics
- Custom analytics dashboard
- File access logging
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure responsive design

## 🐛 Troubleshooting

### Common Issues

**File uploads not working**

- Check file size limits in configuration
- Verify upload directory permissions
- Ensure correct MIME type handling

**Authentication issues**

- Verify JWT secret configuration
- Check session timeout settings
- Clear browser cache and cookies

**Preview not loading**

- Check file path configuration
- Verify file exists in storage
- Check browser console for errors

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Create a new issue with detailed description
- Include error logs and reproduction steps

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Material-UI](https://mui.com/) - UI component library
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## 📞 Support

For support and questions:

- Email: support@your-domain.com
- Documentation: [Link to detailed docs]
- Community: [Link to Discord/Slack]

---

**Built with ❤️ using Next.js and Material-UI**
