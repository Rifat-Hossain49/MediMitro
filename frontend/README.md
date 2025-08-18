# MediMitro Frontend

A modern, responsive Next.js frontend for the MediMitro Digital Health Hub platform. This application provides a comprehensive healthcare management interface with an attractive and user-friendly design.

## Features

### 🏥 **Dashboard**
- Health overview (appointments, prescriptions, health records, specialists consulted)
- Upcoming appointments with status tracking
- Quick action buttons for common tasks
- Recent activity feed
- Daily health tips

### 📅 **Appointments**
- Book new appointments with available doctors
- Search and filter doctors by specialty
- View upcoming appointments with details
- Appointment statistics and management
- Support for both in-person and video consultations

### 📋 **Health Records**
- Complete medical history tracking
- Test results management
- Basic health metrics (weight, height, BMI, blood type)
- Current medications list
- Document upload and management
- Health summary and trends

### 👤 **Profile Management**
- Personal information management
- Health information tracking
- User preferences and settings
- Security and privacy controls
- Account statistics

### ⚙️ **Settings**
- General account settings
- Notification preferences
- Privacy and security controls
- Appearance customization
- Data export and management

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI Components**: Custom components with Headless UI patterns
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Dashboard
│   │   ├── appointments/      # Appointments page
│   │   ├── records/           # Health records page
│   │   ├── profile/           # Profile page
│   │   └── settings/          # Settings page
│   ├── components/            # Reusable components
│   │   └── Navigation.tsx     # Main navigation component
│   └── styles/                # Global styles
├── public/                    # Static assets
├── package.json
└── README.md
```

## Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Secondary**: Green (#10B981)
- **Accent**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700

### Components
- Modern card-based layouts
- Consistent spacing and padding
- Responsive grid systems
- Interactive hover states
- Smooth transitions and animations

## Key Features

### 🎨 **Modern UI/UX**
- Clean, professional design
- Responsive layout for all devices
- Intuitive navigation
- Consistent visual hierarchy
- Accessibility considerations

### 📱 **Mobile-First Design**
- Responsive breakpoints
- Touch-friendly interactions
- Optimized for mobile devices
- Progressive enhancement

### 🔒 **Security Features**
- Password visibility toggle
- Two-factor authentication support
- Privacy controls
- Data export capabilities

### ⚡ **Performance**
- Next.js optimization
- Image optimization
- Code splitting
- Fast loading times

## API Integration

The frontend is designed to integrate with a backend API. Key endpoints include:

- `/api/appointments` - Appointment management
- `/api/records` - Health records
- `/api/profile` - User profile
- `/api/settings` - User settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**MediMitro** - Your comprehensive digital health platform for better healthcare management.

## Authentication (Clerk)

This project uses Clerk for authentication.

### Setup
1. Create a project at the Clerk Dashboard.
2. Copy your Publishable Key and Secret Key.
3. Create a `.env.local` in `frontend/` based on `.env.local.example`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_SIGN_IN_URL=/sign-in
   CLERK_SIGN_UP_URL=/sign-up
   CLERK_AFTER_SIGN_IN_URL=/
   CLERK_AFTER_SIGN_UP_URL=/
   ```
4. Restart the dev server.

### Notes
- The app layout checks for `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` at runtime. If missing, it renders a fallback UI to prevent build-time failures.
- All routes are protected by default via middleware, except `/sign-in` and `/sign-up`.
- Use the `UserButton` in the navbar to sign out.
