# Teknisk Dokumentation: PDF Generator til Byggeprojekter

## Projektbeskrivelse

Dette projekt er en single-page webapplikation til generering af samlede PDF-rapporter, specifikt designet til byggeprojekter. Applikationen tillader brugere at:

1. Uploade en PDF-forside
2. Uploade mapper med PDF- og JPEG-filer, der automatisk struktureres
3. Vælge eller oprette byggeprojektinformation fra en database
4. Generere en samlet PDF med automatisk indholdsfortegnelse og sidenummerering

Applikationen er specifikt rettet mod byggeprojekter, hvor den samlede dokumentation skal organiseres systematisk med standardiserede dokumentnumre og konsistent formatering.

## Teknisk Stack

### Frontend
- **React.js** med TypeScript
- **Vite** som build-værktøj
- **TailwindCSS** til styling
- **ShadCN UI** komponenter (baseret på Radix UI) for brugergrænsefladen
- **PDF-lib** til PDF-generering på klientsiden
- **Wouter** til routing
- **TanStack Query** til datahåndtering

### Backend
- **Express.js** server
- **Drizzle ORM** til databaseoperationer
- **PostgreSQL** database

## Systemarkitektur

Applikationen er opbygget efter en client-server arkitektur med følgende komponenter:

1. **Frontend** (React SPA):
   - Håndterer filupload og -organisering
   - Viser byggeprojekter fra databasen
   - Genererer PDF-filer ved hjælp af pdf-lib biblioteket
   
2. **Backend** (Express.js):
   - Leverer API-endepunkter for CRUD-operationer på byggeprojekter
   - Håndterer databaseadgang via Drizzle ORM
   - Server statiske filer

3. **Database** (PostgreSQL):
   - Gemmer information om byggeprojekter

## Database Schema

```typescript
// Byggeprojekt-tabel
export const buildingProjects = pgTable("building_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  pdfName: text("pdf_name").notNull(),
  docNumber1: text("doc_number_1").notNull(),
  docNumber2: text("doc_number_2").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## Hovedkomponenter

### PDFGenerator Komponent
Hovedkomponenten, der håndterer:
- Valg af byggeprojekt fra dropdown
- Upload af forside-PDF
- Upload af mapper med dokumenter
- Organisering af struktur for indholdsfortegnelse
- Generering og download af den endelige PDF

### BuildingProjectDialog Komponent
Dialog til oprettelse af nye byggeprojekter med:
- Inputfelter for navn, PDF-navn og dokumentnumre
- Validering af input
- Lagring til databasen

### EditBuildingProjectDialog Komponent
Dialog til redigering af eksisterende byggeprojekter med:
- Forudfyldte inputfelter baseret på det valgte projekt
- Validering af input
- Opdatering i databasen

### FolderStructure Komponent
Komponent til visning og redigering af den automatisk genererede mappestruktur:
- Viser sektioner og undersektioner baseret på uploadet mappestruktur
- Tillader brugeren at vælge, hvilke sektioner der skal vises i indholdsfortegnelsen

## PDF-generering

PDF-genereringen sker på klientsiden ved hjælp af PDF-lib biblioteket:

1. Uploadet forside kombineres med indholdsfortegnelse
2. Alle uploadede PDF-filer sammensættes i rækkefølge
3. Sidenumre tilføjes i bunden af hver side (format: "Side X af Y")
4. To dokumentnumre tilføjes i toppen af hver side (venstre og center)
5. Den samlede PDF downloades automatisk

## API-endepunkter

### Byggeprojekter
- `GET /api/building-projects` - Hent alle byggeprojekter
- `GET /api/building-projects/:id` - Hent et specifikt byggeprojekt
- `POST /api/building-projects` - Opret et nyt byggeprojekt
- `PATCH /api/building-projects/:id` - Opdater et byggeprojekt
- `DELETE /api/building-projects/:id` - Slet et byggeprojekt

## Filstruktur og Kodemønstre

### Frontend
- **Pages**: `PDFGenerator.tsx` som hovedkomponenten
- **Components**: Genbrugelige komponenter som `BuildingProjectDialog.tsx`, `FolderStructure.tsx` osv.
- **Lib**: Utilities som `pdfUtils.ts` til PDF-generering, `queryClient.ts` til API-kald

### Backend
- **Routes**: API-endepunkter defineret i `routes.ts`
- **Storage**: Databaseadgang via `storage.ts`
- **Schema**: Databasemodeller defineret i `schema.ts`

## Dataflow

1. **Byggeprojekt Håndtering**:
   - Bruger vælger eller opretter et byggeprojekt via UI
   - Frontend kommunikerer med backend via API
   - Data gemmes i PostgreSQL database
   
2. **PDF Generering**:
   - Bruger uploader forside og mapper med filer
   - Frontend bearbejder filerne og ekstraherer mappestrukturen
   - Bruger justerer indholdsfortegnelse via checkbox-kontroller
   - PDF genereres helt på klientsiden ved hjælp af PDF-lib
   - Genereret PDF downloades til brugerens enhed

## Implementeringsdetaljer

### Mappestruktur Håndtering
```typescript
// Eksempel på mappestruktur-typer
export interface SubpointType {
  id: string;
  title: string;
  files: File[];
  showInToc: boolean;
}

export interface SectionType {
  id: string;
  title: string;
  files: File[];
  subpoints: SubpointType[];
  showInToc: boolean;
}

export interface FolderStructureType {
  sections: SectionType[];
}
```

### PDF Generering
PDF-genereringen håndteres i `pdfUtils.ts` med følgende hovedfunktionalitet:
- Læsning af uploadede filer
- Konvertering af JPEG til PDF
- Generering af indholdsfortegnelse
- Tilføjelse af sidenumre og dokumentnumre
- Sammensætning af den endelige PDF

## Deployment

Applikationen er konfigureret til at køre i Replit:
- **Development**: `npm run dev` starter både frontend og backend
- **Production**: `npm run build` og `npm run start` for produktion

## Nødvendige Miljøvariabler
- `DATABASE_URL`: PostgreSQL-forbindelse
- Andre PostgreSQL-relaterede miljøvariabler: `PGUSER`, `PGHOST`, osv.

## Yderligere Funktioner og Udvidelsesmuligheder

1. **Brugerhåndtering**:
   - Tilføjelse af brugerregistrering og login
   - Tilknytning af brugere til specifikke projekter

2. **PDF-skabeloner**:
   - Mulighed for at gemme og genbruge konfigurationer

3. **Batch-upload**:
   - Optimering for håndtering af større mængder filer

4. **Preview-funktionalitet**:
   - Forhåndsvisning af den genererede PDF før download

## Opsætningsvejledning

1. **Forudsætninger**:
   - Node.js (version 18 eller nyere)
   - PostgreSQL database

2. **Installation**:
   ```
   npm install
   ```

3. **Miljøvariabel opsætning**:
   - Konfigurer `DATABASE_URL` og andre nødvendige miljøvariabler

4. **Database setup**:
   ```
   npm run db:push
   ```

5. **Start udvikling**:
   ```
   npm run dev
   ```

## Tips til Udvikling

1. **Udviklingsservere**:
   - Backend kører på port 5000
   - Vite dev server tilbyder hot reload

2. **Databasemigration**:
   - Brug `npm run db:push` til at synkronisere skema

3. **PDF Fejlfinding**:
   - PDF-lib har begrænset debug-information, anvend konsollogning for at spore problemer