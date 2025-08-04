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

## Current Status (January 2025)

**Core Features Completed**:
- ✅ PDF generation with automatic A4 standardization
- ✅ JPG image processing with 90% scaling and centering
- ✅ Drag-and-drop reorganization of folders and subfolders
- ✅ Numerical sorting of building projects dropdown
- ✅ Unlimited folder nesting support
- ✅ Automatic table of contents generation
- ✅ Standard cover page integration with form filling
- ✅ Edge browser compatible folder uploads
- ✅ Building project management (CRUD operations)

**Technical Implementation Details**:
- All PDF pages are automatically resized to A4 format (595.28 x 841.89 points)
- Intelligent tolerance system preserves pages already close to A4 size
- 90% scaling with centering provides professional margins
- Drag-and-drop changes now properly update PDF generation order
- Numerical sorting works with complex project names containing multiple numbers

## Deployment Information

A comprehensive deployment guide has been created in `DEPLOYMENT_GUIDE.md` containing:
- Complete tech stack overview
- Project structure explanation
- Environment variables requirements
- Build and deployment processes
- Hosting platform recommendations
- Security and performance considerations

## Next Steps

1. **Backup Deployment**: Use DEPLOYMENT_GUIDE.md to set up hosting on alternative platforms
2. **Performance Optimization**: Monitor memory usage during large PDF processing
3. **User Experience**: Consider adding PDF preview functionality
4. **Security**: Implement proper file upload validation and size limits