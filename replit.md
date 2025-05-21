# PDF Generator Application Guide

## Overview

This application is a PDF generator tool that allows users to upload files (PDFs and images), organize them into a structured document with sections and subsections, and then generate a compiled PDF with a table of contents. The application consists of a React frontend with a modern UI built using ShadCN UI components, and an Express backend that handles API requests and server-side operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a client-server architecture:

1. **Frontend**: React application with ShadCN UI components for the user interface
2. **Backend**: Express.js server for handling API requests and business logic
3. **Database**: Drizzle ORM with Postgres (setup in progress)
4. **PDF Processing**: PDF-lib for client-side PDF generation and manipulation

The application is designed to be deployed to a platform that supports Node.js applications, with separate build processes for the frontend and backend.

## Key Components

### Frontend

1. **React Application**:
   - Built with Vite for development and bundling
   - Uses React Router (via Wouter) for navigation
   - Styled with Tailwind CSS and ShadCN UI components
   - PDF generation logic implemented in the client using pdf-lib

2. **Key Features**:
   - File upload functionality for PDFs and images
   - Organization of files into sections and subsections
   - Generation of a table of contents
   - PDF compilation with client-side processing

3. **Pages**:
   - `PDFGenerator`: Main page for the PDF generation functionality
   - `NotFound`: 404 page for handling invalid routes

### Backend

1. **Express Server**:
   - Handles API requests and serves the frontend
   - Includes middleware for request logging and error handling
   - Routes defined in `server/routes.ts`

2. **Storage**:
   - Currently using in-memory storage (`MemStorage` class)
   - Database integration with Drizzle ORM in progress
   - Schema defined in `shared/schema.ts`

### Database

1. **Schema**:
   - Currently has a `users` table with basic authentication fields
   - Uses Drizzle ORM for database operations
   - Schema can be extended for storing PDF configurations and user data

## Data Flow

1. **User Authentication** (to be implemented):
   - Users register/login via the API
   - Server validates credentials and manages sessions

2. **PDF Generation**:
   1. User uploads files and organizes them in the frontend
   2. User configures sections, subsections, and table of contents
   3. Frontend generates the PDF using pdf-lib
   4. Generated PDF is downloaded to the user's device

## External Dependencies

### Frontend Libraries
- React for UI components
- Tailwind CSS for styling
- ShadCN UI (built on Radix UI) for UI components
- Wouter for routing
- React Query for data fetching
- PDF-lib for PDF generation

### Backend Libraries
- Express.js for the server
- Drizzle ORM for database operations
- Connect-pg-simple for session management (to be implemented)

### Database
- PostgreSQL via Drizzle ORM

## Deployment Strategy

The application is configured for deployment through Replit:

1. **Development Mode**:
   - `npm run dev` starts both the frontend and backend in development mode
   - Vite handles hot module replacement for the frontend

2. **Production Build**:
   - Frontend: Built with Vite (`vite build`)
   - Backend: Built with esbuild to the `dist` directory
   - Combined build command: `npm run build`

3. **Production Start**:
   - `npm run start` runs the built application from the `dist` directory

## Getting Started

1. The application requires a PostgreSQL database. Make sure it's properly configured in the Replit environment.
2. Set the DATABASE_URL environment variable to connect to your PostgreSQL database.
3. Run `npm run db:push` to create the database schema.
4. Run `npm run dev` to start the development server.
5. To build for production, run `npm run build` followed by `npm run start`.

## Next Steps

1. **Complete PDF Generation Features**:
   - Improve the file handling and organizational features
   - Add PDF preview functionality

2. **Implement User Authentication**:
   - Complete the user registration and login flows
   - Set up session management

3. **Database Integration**:
   - Extend the database schema to store PDF configurations
   - Implement saving/loading of user PDF templates

4. **API Development**:
   - Create endpoints for user management
   - Implement endpoints for saving and retrieving PDF configurations