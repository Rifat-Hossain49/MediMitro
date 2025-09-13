# MediMitra Frontend Setup Guide

## 1. Environment Configuration

### Step 1: Create Environment File
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your configuration:
   ```env
   # NextAuth.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret-key-here

   # Spring Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:8080/api

   # OAuth Providers (Optional - for social login)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

### Step 2: Generate NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Add the output to `NEXTAUTH_SECRET` in your `.env.local` file.

### Step 3: Backend Integration
This frontend is designed to work with a Spring Boot backend using JDBC for data persistence. Ensure your Spring backend is running on the configured API URL.

## 2. OAuth Providers Setup (Optional)

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### GitHub OAuth Setup
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

## 3. Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 4. Authentication Features

### Available Authentication Methods:
- 🚧 **Email/Password** - To be implemented via Spring backend API
- ✅ **Google OAuth** - Social login with Google
- ✅ **GitHub OAuth** - Social login with GitHub
- 🚧 **Role-based Access** - To be implemented via Spring backend
- ✅ **Protected Routes** - Automatic redirect for unauthenticated users
- ✅ **Session Management** - Secure JWT sessions

### User Roles:
- **Patient**: Access to appointments, medical records, prescriptions
- **Doctor**: Access to patient management, appointments, prescriptions
- **Pharmacist**: Access to medication management, prescription fulfillment
- **Admin**: Full system access (can be added later)

## 5. Backend Integration

The frontend communicates with a Spring Boot backend for data persistence:

- **User Management**: Handled by Spring Security and JDBC
- **Healthcare Data**: Managed via Spring Data JDBC repositories
- **API Communication**: RESTful endpoints for all operations
- **Database Schema**: Defined in Spring backend using JDBC/SQL

## 6. Security Features

- 🔒 **Password Hashing**: Bcrypt with salt rounds
- 🛡️ **CSRF Protection**: Built-in NextAuth.js protection
- 🔐 **Secure Sessions**: JWT with configurable expiration
- 🌐 **HTTPS Enforcement**: Production-ready security headers
- 🚫 **Route Protection**: Middleware-based authentication

## 7. Production Deployment

For production deployment:

1. Update `NEXTAUTH_URL` to your production domain
2. Use strong, unique `NEXTAUTH_SECRET`
3. Configure production OAuth callback URLs
4. Set up proper SSL certificates
5. Update `NEXT_PUBLIC_API_URL` to your production Spring backend URL

## Troubleshooting

### Common Issues:
1. **Backend Connection**: Ensure Spring backend is running and accessible
2. **OAuth Errors**: Check callback URLs match exactly
3. **Build Errors**: Run `npm run build` to check for TypeScript errors
4. **Environment Variables**: Ensure all required variables are set in `.env.local`
5. **API Errors**: Check that Spring backend endpoints are properly configured

Need help? Check the [NextAuth.js documentation](https://next-auth.js.org/) or [Spring Boot documentation](https://spring.io/projects/spring-boot).
