# JIMS Backend API

A comprehensive backend API for the Jammer Installation Management System (JIMS) built with Fastify, Drizzle ORM, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas for request/response validation
- **API Documentation**: Auto-generated API docs
- **Error Handling**: Comprehensive error handling and logging
- **CORS**: Configurable CORS support for frontend integration

## Tech Stack

- **Framework**: Fastify
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multipart support for images and documents

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd jims-backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
\`\`\`

4. Set up the database:
\`\`\`bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
\`\`\`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get current user profile

### Dashboard
- `GET /api/dashboard/stats` - Get system statistics
- `GET /api/dashboard/activity` - Get recent activity
- `GET /api/dashboard/health` - Get system health status

### Examinations
- `GET /api/examinations` - List all examinations
- `POST /api/examinations` - Create new examination
- `GET /api/examinations/:id` - Get examination details
- `PUT /api/examinations/:id` - Update examination
- `DELETE /api/examinations/:id` - Delete examination
- `POST /api/examinations/:id/centers` - Add exam center

### Jammers
- `GET /api/jammers` - List all jammers with filtering
- `POST /api/jammers` - Create new jammer
- `GET /api/jammers/:id` - Get jammer details
- `PUT /api/jammers/:id` - Update jammer
- `DELETE /api/jammers/:id` - Delete jammer
- `GET /api/jammers/stats/overview` - Get jammer statistics

### Organizations
- `GET /api/organizations` - List all organizations
- `POST /api/organizations` - Create new organization
- `GET /api/organizations/:id` - Get organization details
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

### Shipments
- `GET /api/shipments` - List all shipments
- `POST /api/shipments` - Create new shipment
- `GET /api/shipments/:id` - Get shipment details
- `PUT /api/shipments/:id/status` - Update shipment status

## Database Schema

The system uses the following main entities:

- **Users**: System users with role-based access
- **Organizations**: Warehouses and installation agencies
- **Examinations**: Exam events with multiple centers
- **Exam Centers**: Individual exam locations
- **Jammers**: Signal jamming devices with tracking
- **Shipments**: Logistics for moving jammers
- **Installation Tasks**: Field operator task tracking
- **Activity Logs**: System audit trail

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### User Roles

- **admin**: Full system access (BEL administrators)
- **warehouse**: Warehouse operations access
- **operator**: Field operator access for installations

## Development

### Database Operations

\`\`\`bash
# Generate new migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset and seed database
npm run db:seed
\`\`\`

### Environment Variables

\`\`\`env
DATABASE_URL=postgresql://username:password@localhost:5432/jims_db
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
NODE_ENV=development
\`\`\`

## Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Start the server: `npm start`

## API Response Format

### Success Response
\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
\`\`\`

### Error Response
\`\`\`json
{
  "error": "Error message",
  "details": "Additional error details"
}
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
