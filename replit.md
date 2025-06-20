# HR Management System

## Overview

This is a full-stack HR Management System built with modern web technologies. The application provides comprehensive employee management, payroll processing, role management, and reporting capabilities. It uses a React frontend with Express.js backend, PostgreSQL database with Drizzle ORM, and shadcn/ui components for a modern user interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for fast development and optimized production builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured with Neon serverless driver)
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: TSX for TypeScript execution

### Key Design Patterns
- **Repository Pattern**: Implemented through storage abstraction layer
- **Factory Pattern**: Used for employee and payslip calculator creation
- **Template Method Pattern**: Applied in payslip calculations
- **Abstract Classes**: BaseEmployee and PayslipCalculator demonstrate inheritance and polymorphism

## Key Components

### Database Schema
The system uses three main entities:
- **Roles**: Job positions with salary ranges, responsibilities, and hierarchy levels
- **Employees**: Personal information, employment details, and role associations
- **Payslips**: Payroll records with calculations for regular/overtime pay and deductions

### API Endpoints
- `/api/stats` - Dashboard statistics
- `/api/roles` - Role CRUD operations
- `/api/employees` - Employee management
- `/api/payslips` - Payroll processing
- `/api/calculate-payslip` - Payslip calculations

### Frontend Pages
- **Dashboard**: System overview with key metrics and quick actions
- **Employees**: Employee listing, creation, and management
- **Payslips**: Payroll generation and management
- **Roles**: Job role definitions and management
- **Reports**: Analytics and reporting interface

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Processing**: Express routes handle requests and validate input using Zod schemas
3. **Business Logic**: Object-oriented classes handle complex calculations and operations
4. **Data Persistence**: Drizzle ORM manages database operations with PostgreSQL
5. **Response Handling**: JSON responses are cached and managed by React Query

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Process**: `npm run dev` starts the development server
- **Hot Reload**: Vite provides fast refresh for frontend changes
- **Database**: Drizzle kit handles schema migrations

### Production Deployment
- **Build Process**: Vite builds the frontend, ESBuild bundles the backend
- **Deployment Target**: Autoscale deployment on Replit
- **Port Configuration**: Application runs on port 5000, exposed as port 80
- **Static Assets**: Frontend builds to `dist/public`, served by Express

### Database Management
- **Migrations**: Stored in `/migrations` directory
- **Schema**: Defined in `/shared/schema.ts` with Zod validation
- **Push Command**: `npm run db:push` deploys schema changes

## Changelog
- June 20, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.