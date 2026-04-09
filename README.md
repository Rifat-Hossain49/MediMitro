# MediMitro - Digital Health Hub

<div align="center">

![MediMitro Banner](https://img.shields.io/badge/MediMitro-Digital%20Health%20Hub-3B82F6?style=for-the-badge&logo=health&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-6DB33F?style=flat-square&logo=spring&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=flat-square&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**A comprehensive full-stack healthcare management platform enabling seamless patient-doctor interactions, telemedicine, and digital health record management.**

</div>

---

## Project Overview

MediMitro is a modern digital health platform built to revolutionize healthcare accessibility. The platform connects patients with healthcare providers through an intuitive interface, enabling appointment scheduling, telemedicine consultations, electronic health records (EHR), prescription management, and emergency services.

### Key Highlights

- **Multi-role System**: Separate portals for Patients, Doctors, Administrators, and Pharmacists
- **Telemedicine**: Video consultation capabilities with integrated messaging
- **AI-Powered**: Smart doctor search and symptom checker powered by AI
- **Real-time Services**: Ambulance booking, ICU bed availability tracking
- **Security-First**: JWT authentication with role-based access control

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Modern responsive styling |
| **NextAuth.js** | Authentication & session management |
| **Framer Motion** | Smooth animations & transitions |
| **React Hook Form + Zod** | Form validation |
| **Appwrite** | File storage for medical documents |

### Backend
| Technology | Purpose |
|------------|---------|
| **Spring Boot 3.2.1** | REST API framework |
| **Spring Security** | Authentication & authorization |
| **Spring JDBC** | Database operations |
| **JWT (jjwt)** | Stateless authentication |
| **BCrypt** | Password hashing |
| **PostgreSQL** | Primary database |

---

## Features

### Patient Portal
- **Dashboard**: Health overview, upcoming appointments, recent activity
- **Appointments**: Book/manage consultations with specialists
- **Health Records**: Personal medical history, test results, vitals
- **EHR Management**: Upload and share electronic health documents
- **Messaging**: Direct communication with healthcare providers
- **Profile Management**: Personal information and preferences

### Doctor Portal
- **Patient Management**: View and manage assigned patients
- **Appointment Scheduling**: Manage consultation slots
- **Credentials Display**: Professional profile and certifications
- **Prescription Writing**: Digital prescription generation
- **Messaging**: Patient communication center
- **Meeting Integration**: Video consultation support

### Admin Dashboard
- **Doctor Verification**: Review and approve medical credentials
- **User Management**: System-wide user administration
- **Analytics Dashboard**: Platform statistics and metrics

### Emergency Services
- **Ambulance Booking**: Real-time emergency vehicle dispatch
- **ICU Bed Tracker**: Live availability monitoring across facilities

### AI Integration
- **Smart Symptom Checker**: AI-powered health assessment
- **Doctor Search**: Intelligent specialist recommendation

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐│
│  │ Patient  │  │  Doctor  │  │  Admin   │  │ Emergency Portal ││
│  │  Portal  │  │  Portal  │  │ Dashboard│  │                  ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                    REST API (JWT Auth)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Spring Boot)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐│
│  │ Controllers  │  │   Services   │  │    Repositories        ││
│  │  - Auth      │  │  - User      │  │    (Spring JDBC)       ││
│  │  - Doctor    │  │  - Doctor    │  │                        ││
│  │  - Appointment│ │  - AI/ML     │  │                        ││
│  │  - Messaging │  │  - Storage   │  │                        ││
│  └──────────────┘  └──────────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │    PostgreSQL     │
                    │   Database       │
                    └───────────────────┘
```

---

## Database Schema

### Core Entities
- **Users**: Authentication and profile data
- **Doctors**: Medical credentials, specializations, availability
- **Appointments**: Consultation scheduling and status
- **Prescriptions**: Digital prescriptions with medication details
- **MedicalRecords**: Patient health history and documents
- **EHRDocuments**: Electronic health record storage
- **ICUBeds**: Real-time bed availability tracking
- **AmbulanceBookings**: Emergency service management
- **Messages**: Doctor-patient communication

---

## Getting Started

### Prerequisites
- **Java** 17+
- **Node.js** 18+
- **Maven** 3.6+
- **PostgreSQL** 12+

### Backend Setup

```bash
cd backend

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Build and run
mvn clean install
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API URLs

# Run development server
npm run dev
```

### Default Credentials (Development)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medimitra.com | password123 |
| Doctor | dr.smith@medimitra.com | password123 |
| Patient | patient1@example.com | password123 |

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/verify` - Token verification

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/{id}/status` - Update status

### Doctors
- `GET /api/doctors` - List verified doctors
- `GET /api/doctors/{id}` - Doctor profile
- `POST /api/doctors/register` - Doctor registration

### Emergency Services
- `POST /api/ambulance/book` - Book ambulance
- `POST /api/ambulance/emergency-book` - Emergency booking
- `GET /api/icu-beds/available` - ICU availability

---

## Security Features

- **JWT Authentication**: Stateless, configurable token expiration
- **Role-Based Access Control**: Granular permissions per user role
- **BCrypt Password Hashing**: Industry-standard security
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Comprehensive request validation
- **Protected Routes**: Middleware-based route security

---

## Project Structure

```
MediMitro/
├── frontend/                    # Next.js Frontend Application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── dashboard/     # Patient dashboard
│   │   │   ├── doctor-portal/ # Doctor interface
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── appointments/  # Appointment management
│   │   │   └── ...
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/               # API services & utilities
│   │   └── contexts/          # React contexts
│   └── package.json
│
├── backend/                    # Spring Boot Backend API
│   ├── src/main/java/com/medimitra/backend/
│   │   ├── controller/       # REST controllers
│   │   ├── service/          # Business logic
│   │   ├── repository/       # Data access layer
│   │   ├── model/            # Entity classes
│   │   └── security/         # Security configuration
│   └── pom.xml
│
├── Digital_Health_Hub_Proposal.docx
├── create-pghd-table.sql
└── README.md
```

---

## Development Highlights

### Challenges Solved
- **Multi-tenant Architecture**: Separate role-based access with shared healthcare data
- **Real-time Updates**: ICU bed availability and ambulance tracking
- **AI Integration**: Intelligent symptom checker and doctor recommendation
- **Document Management**: Secure EHR storage with Appwrite integration

---

## Author
**Musa Tur Farazi**
**Rifat Hossain**

---

<div align="center">

**MediMitro** - Empowering Digital Healthcare

</div>
