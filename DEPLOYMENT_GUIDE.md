# PDF Generator Application - Deployment Guide

## Overview
Dette er en full-stack PDF generator applikation designet til dansk byggeprojekt dokumentation. Applikationen kan kombinere multiple PDF'er og billeder til ét samlet dokument med indholdsfortegnelse.

## Tech Stack

### Frontend
- **React.js** (TypeScript) - UI framework
- **Vite** - Build tool og development server
- **Tailwind CSS** - Styling framework
- **ShadCN UI** - UI component library (baseret på Radix UI)
- **PDF-lib** - Client-side PDF manipulation
- **React Query (@tanstack/react-query)** - Data fetching og cache
- **Wouter** - Routing library
- **@dnd-kit** - Drag-and-drop funktionalitet

### Backend
- **Node.js** med **Express.js** - Server framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database

### Key Dependencies
```json
{
  "pdf-lib": "PDF manipulation",
  "@dnd-kit/core": "Drag and drop",
  "@radix-ui/react-*": "UI primitives", 
  "@tanstack/react-query": "Data fetching",
  "drizzle-orm": "Database ORM",
  "express": "Server framework",
  "wouter": "Client-side routing"
}
```

## Project Structure

```
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities og core logic
│   │   │   ├── pdfUtils.ts  # PDF generation logic
│   │   │   ├── types.ts     # TypeScript type definitions
│   │   │   └── utils.ts     # General utilities
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # App entry point
│   └── index.html           # HTML template
├── server/                   # Backend Express server
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes
│   ├── db.ts                # Database connection
│   ├── storage.ts           # Data storage interface
│   └── vite.ts              # Vite integration
├── shared/                   # Shared code mellem frontend/backend
│   └── schema.ts            # Database schema og types
├── package.json             # Dependencies og scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS config
├── drizzle.config.ts        # Database config
└── tsconfig.json            # TypeScript config
```

## Main Files Explained

### Core Application Files
1. **`client/src/pages/PDFGenerator.tsx`** - Hovedsiden med al PDF funktionalitet
2. **`client/src/lib/pdfUtils.ts`** - PDF generation logic og file processing
3. **`server/index.ts`** - Express server setup og middleware
4. **`server/routes.ts`** - API endpoints for building projects
5. **`shared/schema.ts`** - Database schema definitionen

### Key Configuration Files
1. **`package.json`** - Dependencies og build scripts
2. **`vite.config.ts`** - Frontend build configuration
3. **`drizzle.config.ts`** - Database migration settings
4. **`tailwind.config.ts`** - CSS framework settings

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database
PGHOST=your_postgres_host
PGPORT=5432
PGUSER=your_postgres_user
PGPASSWORD=your_postgres_password
PGDATABASE=your_database_name

# Node.js Environment
NODE_ENV=production  # eller development
```

## Build & Deployment Process

### Development Mode
```bash
npm install           # Install dependencies
npm run db:push      # Create database tables
npm run dev          # Start development server (port 5000)
```

### Production Build
```bash
npm run build        # Build both frontend og backend
npm run start        # Start production server
```

### Build Scripts Breakdown
- `npm run dev` - Starter både frontend (Vite) og backend (Express) i development mode
- `npm run build` - Bygger frontend til `dist/client` og backend til `dist/server`
- `npm run start` - Kører production server fra `dist` directory
- `npm run db:push` - Synkroniserer database schema

## Database Setup

Applikationen bruger PostgreSQL med følgende tabeller:
- `users` - User authentication (basis struktur)
- `building_projects` - Gemmer anlægsinformation og PDF konfiguration

Database schema er defineret i `shared/schema.ts` med Drizzle ORM.

## Static Files

- **`standard_forside.pdf`** - Standard forside template (skal placeres i root directory)
- **`attached_assets/`** - Bruger-uploadede filer og billeder

## Port Configuration

- **Development**: Frontend (Vite dev server) og backend kører på samme port (5000)
- **Production**: Express server serverer både API og static frontend files på port 5000

## Key Features Implementation

### PDF Generation
- Client-side PDF manipulation med pdf-lib
- Automatisk A4 standardisering af alle sider
- JPG billede integration med skalering
- Automatisk indholdsfortegnelse generation

### File Processing
- Edge browser kompatibel folder upload
- Numerisk sortering af mapper (P001, P002, etc.)
- Drag-and-drop reorganisering med @dnd-kit
- Support for unlimited folder nesting

### Data Persistence
- Building projects gemmes i PostgreSQL
- Session management (kan implementeres)
- RESTful API design

## Hosting Requirements

### Minimum Requirements
- **Node.js** 18+ 
- **PostgreSQL** database
- **Memory**: 512MB minimum (1GB+ anbefalet for PDF processing)
- **Storage**: SSD anbefalet for file operations

### Recommended Hosting Platforms
1. **Railway** - Automatisk deployment fra Git
2. **Vercel** - God til frontend, kræver separat database
3. **Heroku** - Classic option med PostgreSQL add-ons
4. **DigitalOcean App Platform** - Balanced option
5. **AWS/GCP/Azure** - For enterprise løsninger

## Deployment Checklist

1. ✅ Sæt alle environment variables op
2. ✅ Provision PostgreSQL database
3. ✅ Upload `standard_forside.pdf` til root directory
4. ✅ Kør `npm install`
5. ✅ Kør `npm run db:push` for database setup
6. ✅ Kør `npm run build` for production build
7. ✅ Start applikationen med `npm run start`
8. ✅ Test PDF generation funktionalitet

## Troubleshooting

### Common Issues
1. **Database connection errors** - Check DATABASE_URL og network access
2. **PDF generation fails** - Ensure sufficient memory allocation
3. **File upload issues** - Check file permissions og storage limits
4. **Build failures** - Verify Node.js version og dependencies

### Performance Optimization
- PDF generation kan være memory-intensive ved store filer
- Consider file size limits for uploads
- Database connection pooling for high traffic

## Security Considerations

- Input validation på alle file uploads
- SQL injection protection via Drizzle ORM
- Environment variables for sensitive data
- CORS configuration for production
- File type restrictions (kun PDF og JPG)

## Backup Strategy

- Regular database backups
- Static file backups (`standard_forside.pdf`, user uploads)
- Environment variable documentation
- Code repository backup

Denne guide skulle give dig alt hvad du behøver for at få applikationen hosted på en anden platform.