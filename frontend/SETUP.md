# MediMitra Authentication Setup Guide

## 1. Neon PostgreSQL Database Setup

### Step 1: Create Neon Account
1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up for a free account
3. Create a new project named "medimitra"

### Step 2: Get Database URLs
1. In your Neon project dashboard, go to "Connection Details"
2. Copy both the **Database URL** and **Direct URL**
3. The URLs should look like:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/medimitra?sslmode=require"
   DIRECT_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/medimitra?sslmode=require"
   ```

### Step 3: Create Environment File
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Neon database URLs and other credentials:
   ```env
   # NextAuth.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret-key-here

   # Neon PostgreSQL Database (Replace with your actual URLs)
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/medimitra?sslmode=require"
   DIRECT_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/medimitra?sslmode=require"

   # OAuth Providers (Optional - for social login)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

### Step 4: Generate NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Add the output to `NEXTAUTH_SECRET` in your `.env.local` file.

### Step 5: Initialize Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed with sample data
npx prisma db seed
```

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
- ✅ **Email/Password** - Traditional registration and login
- ✅ **Google OAuth** - Social login with Google
- ✅ **GitHub OAuth** - Social login with GitHub
- ✅ **Role-based Access** - Patient, Doctor, Pharmacist roles
- ✅ **Protected Routes** - Automatic redirect for unauthenticated users
- ✅ **Session Management** - Secure JWT sessions

### User Roles:
- **Patient**: Access to appointments, medical records, prescriptions
- **Doctor**: Access to patient management, appointments, prescriptions
- **Pharmacist**: Access to medication management, prescription fulfillment
- **Admin**: Full system access (can be added later)

## 5. Database Schema

The application includes a comprehensive healthcare database schema with:

- **User Management**: Users, accounts, sessions
- **Healthcare Data**: Appointments, prescriptions, medical records
- **Provider Data**: Doctors, pharmacies, medications
- **Emergency Services**: Emergency contacts, ambulance services

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
5. Configure Neon database for production scaling

## Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure Neon URLs are correct and database is accessible
2. **OAuth Errors**: Check callback URLs match exactly
3. **Build Errors**: Run `npm run build` to check for TypeScript errors
4. **Environment Variables**: Ensure all required variables are set in `.env.local`

Need help? Check the [NextAuth.js documentation](https://next-auth.js.org/) or [Neon documentation](https://neon.tech/docs/).
