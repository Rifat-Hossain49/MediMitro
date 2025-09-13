# MediMitra Backend API

A comprehensive healthcare management system backend built with Spring Boot and JDBC.

## 🚀 Features

- **User Management**: Patient, Doctor, Admin, and Pharmacist roles
- **Authentication**: JWT-based authentication with role-based access control
- **Healthcare Data**: Appointments, prescriptions, medical records
- **Security**: Spring Security with CORS support
- **Database**: PostgreSQL with Spring JDBC
- **API Documentation**: RESTful endpoints with proper error handling

## 🛠️ Technology Stack

- **Framework**: Spring Boot 3.2.1
- **Database**: PostgreSQL with Spring JDBC
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **Java Version**: 17+

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- IDE (IntelliJ IDEA, VS Code, etc.)

## 🔧 Setup Instructions

### 1. Clone and Navigate
```bash
cd backend
```

### 2. Database Setup
Create a PostgreSQL database:
```sql
CREATE DATABASE medimitra;
```

### 3. Environment Configuration
Copy the environment template:
```bash
cp .env.example .env
```

Update `.env` with your database credentials:
```env
DATABASE_URL=jdbc:postgresql://localhost:5432/medimitra
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key_32_chars_min
```

### 4. Build and Run
```bash
# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will be available at: `http://localhost:8080/api`

### 5. Database Schema
The application will automatically create tables on startup using `schema.sql` and populate sample data using `data.sql`.

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/verify` - Verify token

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/all` - Get all users (Admin only)
- `GET /api/users/role/{role}` - Get users by role (Admin only)
- `GET /api/users/stats` - Get user statistics (Admin only)

### Health Check
- `GET /api/health/status` - Service health status
- `GET /api/health/info` - Application information

## 🔐 Authentication

### Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "patient"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Using JWT Token
Include the token in the Authorization header:
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 👥 User Roles

- **Patient**: Access to personal appointments, medical records, prescriptions
- **Doctor**: Manage patient appointments, create prescriptions, view medical records
- **Pharmacist**: Manage prescription fulfillment, medication inventory
- **Admin**: Full system access, user management, system statistics

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and profiles
- `doctors` - Doctor-specific information
- `appointments` - Medical appointments
- `prescriptions` - Medical prescriptions
- `medical_records` - Patient medical records

### Sample Users (Development)
| Email | Password | Role |
|-------|----------|------|
| admin@medimitra.com | password123 | admin |
| dr.smith@medimitra.com | password123 | doctor |
| patient1@example.com | password123 | patient |
| pharmacist@medimitra.com | password123 | pharmacist |

## 🔒 Security Features

- **JWT Authentication**: Stateless authentication with configurable expiration
- **Password Hashing**: BCrypt with salt rounds
- **Role-based Authorization**: Method-level security
- **CORS Configuration**: Frontend integration support
- **Input Validation**: Bean validation on all endpoints

## 🌐 CORS Configuration

Configured to allow requests from frontend (default: `http://localhost:3000`):
- Allowed Origins: Configurable via environment
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed Headers: All headers
- Credentials: Supported

## 📊 Health Monitoring

Check service health:
```bash
curl http://localhost:8080/api/health/status
```

Get application info:
```bash
curl http://localhost:8080/api/health/info
```

## 🚀 Production Deployment

### Environment Variables
Set the following environment variables for production:

```env
DATABASE_URL=your_production_database_url
DB_USERNAME=your_production_db_user
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_strong_jwt_secret_64_chars
CORS_ORIGINS=https://your-frontend-domain.com
SPRING_PROFILES_ACTIVE=production
```

### Build for Production
```bash
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Docker Deployment (Optional)
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 🧪 Testing

Run tests:
```bash
mvn test
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include logs and error messages

## 📞 Contact

MediMitra Development Team
- Email: support@medimitra.com
- GitHub: [MediMitra Repository]

---

**Note**: This is a development setup. For production deployment, ensure proper security configurations, environment variables, and database setup.

