# Mustasharuna API

Backend API for the Mustasharuna platform built with Node.js, Express, TypeScript, and Prisma.

## 🎯 Overview

Mustasharuna API is a RESTful backend service that provides endpoints for managing administrators, companies, consultants, and their associated activities. The API supports role-based access control, activity logging, and comprehensive data management.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma 7
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Email**: Nodemailer
- **Cloud Storage**: AWS S3

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MySQL** (v8 or higher)
- **Git**

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/mustasharunatechchef/backend.git
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory and configure the required environment variables (see [Configuration](#configuration) section).

4. **Generate Prisma Client**

```bash
npm run db:generate
```

5. **Run database migrations**

```bash
npm run db:migrate
```

6. **Seed the database (optional)**

```bash
npm run db:seed
```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following environment variables:

### Required Variables

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/mustasharuna"

# Server
PORT=8000
NODE_ENV=development

# Authentication
ADMIN_COOKIE_SECRET=your-secret-key-here

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_FROM=noreply@mustasharuna.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AWS S3 (if using file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name

# AWS SNS (SMS)
SNS_SENDER_ID=your-sender-id

# AWS Chime SDK
CHIME_REGION=us-east-1
CHIME_MEDIA_REGION=me-south-1
```

### Optional Variables

```env
# Request Limits
REQUEST_LIMIT=10mb

# Database Connection Pool
DATABASE_MAX_CONNECTIONS=10
DATABASE_CONNECTION_TIMEOUT=10000
DATABASE_QUERY_TIMEOUT=30000

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄 Database Setup

### Prisma Configuration

This project uses Prisma 7 with a custom configuration file (`prisma.config.ts`). The Prisma schema is located at `prisma/schema.prisma`.

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Reset database (WARNING: This will delete all data)
npm run db:reset

# Seed the database
npm run db:seed

# Validate Prisma schema
npm run db:validate

# Introspect existing database
npm run db:introspect
```

## Running the Project

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:8000` (or the port specified in your `.env` file).

### Production Mode

1. **Build the project**

```bash
npm run build
```

2. **Start the server**

```bash
npm start
```

## 📜 Available Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start development server with hot reload |
| `npm run build`         | Compile TypeScript to JavaScript         |
| `npm start`             | Start production server                  |
| `npm run db:generate`   | Generate Prisma Client                   |
| `npm run db:migrate`    | Create and apply database migrations     |
| `npm run db:seed`       | Seed the database with initial data      |
| `npm run db:reset`      | Reset database (drops all data)          |
| `npm run db:validate`   | Validate Prisma schema                   |
| `npm run db:introspect` | Introspect existing database             |
| `npm run lint`          | Run ESLint                               |

## 📚 API Documentation

### Swagger UI

Once the server is running, access the interactive API documentation at:

```
http://localhost:8000/swagger
```

The Swagger documentation provides:

- Complete API endpoint listings
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

## 🔐 Authentication

The API uses JWT tokens stored in HTTP-only cookies for admin authentication.

## 🧪 Development

### TypeScript Path Aliases

The project uses TypeScript path aliases for cleaner imports

```typescript
import env from "@config/env";
import prisma from "@database/client";
import { adminGuard } from "@middlewares/adminGuard";
```

Available aliases:

- `@config/*` → `src/config/*`
- `@database/*` → `src/database/*`
- `@middlewares/*` → `src/middlewares/*`
- `@services/*` → `src/services/*`
- `@routes/*` → `src/routes/*`
- `@controllers/*` → `src/controllers/*`
- `@validators/*` → `src/validators/*`
- `@utils/*` → `src/utils/*`
- `@models` → `src/database/generated/client`

### Code Style

- **Linting**: ESLint with strict rules
- **Type Safety**: TypeScript strict mode enabled
- **Formatting**: Follow existing code style

### Git Hooks

The project uses Husky for Git hooks. Pre-commit hooks will run linting automatically.

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct in `.env`
- Ensure MySQL is running
- Check database credentials and permissions

### Prisma Client Generation Issues

```bash
# Regenerate Prisma Client
npm run db:generate
```

### Port Already in Use

Change the `PORT` in your `.env` file or kill the process using the port.

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 👤 Author

**Hassan Ismail**

- GitHub: [@mustasharunatechchef](https://github.com/mustasharunatechchef)

## 🔗 Links

- **Repository**: [https://github.com/mustasharunatechchef/backend](https://github.com/mustasharunatechchef/backend)
- **Issues**: [https://github.com/mustasharunatechchef/backend/issues](https://github.com/mustasharunatechchef/backend/issues)

---

For more information, please refer to the [API Documentation](http://localhost:8000/swagger) when the server is running.
