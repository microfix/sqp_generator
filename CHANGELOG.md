# Changelog - PDF Generator KS

## Version 2.0 - 24. juni 2025

### 🚀 Nye funktioner

#### Automatisk formularudfyldelse
- **PDF-formularer udfyldes automatisk** med projektdata ved generering
- **Centreret tekst** i alle formularfelter for professionelt udseende
- **Datoformat standardiseret** til dansk format (YYYY.MM.DD)
- Automatisk udfyldelse af "unitname" og "date" felter i forsider

#### Forbedret projekthåndtering
- **Automatisk PDF-navngivning** baseret på projekttype og navn
- **Projekttype-specifike dokumentnumre**:
  - BU-projekter: "Bilag 2 til SAT" prefix
  - HVAC-projekter: "Bilag 3 til SAT" prefix
- **Dokumentnummer-optimering**: Kun NNPPV-delen indtastes (første del tilføjes automatisk)
- **Real-time søgning** i projektlisten for hurtig filtrering

#### Edge Browser-kompatibilitet
- **Specialløsning til Edge browser** på firmacomputere
- **Trinvis mappeupload** - upload én mappe ad gangen
- **Automatisk sammenlægning** af flere mapper til samme projekt
- **Klar vejledning** til Edge-brugere med trin-for-trin instruktioner

#### Brugervenlig interface
- **Integreret hjælpesystem** med detaljeret SQP-rapport guide
- **Dalux-integration instruktioner** for korrekt workflow
- **Forbedret fejlhåndtering** med brugervenlige beskeder
- **Responsivt design** der fungerer på alle skærmstørrelser

### 🔧 Tekniske forbedringer

#### Database-integration
- **PostgreSQL database** til permanent projekthåndtering
- **Drizzle ORM** for type-sikker databaseadgang
- **Automatisk skema-migrering** ved opdateringer
- **Robust fejlhåndtering** for databaseoperationer

#### PDF-behandling
- **Avanceret PDF-sammenlægning** med pdf-lib
- **Intelligent mappestruktur-genkendelse** fra uploads
- **Automatisk indholdsfortegnelse** baseret på mappestruktur
- **JPEG til PDF-konvertering** for billedfiler

#### Performance-optimering
- **React Query** til effektiv data-caching
- **Hot module replacement** for hurtig udvikling
- **Optimeret bundling** med Vite
- **Lazy loading** af komponenter

### 🛠️ Fejlrettelser

#### Browser-kompatibilitet
- **Løst Edge browser mappeupload-problem** med webkitdirectory-attribut
- **Forbedret fejlmeddelelser** ved browser-inkompatibilitet
- **Fallback-løsninger** for ældre browsere

#### Stabilitet
- **Robust filhåndtering** med bedre fejlhåndtering
- **Memory leak-forebyggelse** i PDF-behandling
- **Forbedret error boundaries** for bedre brugeroplevelse

### 📋 Arkitektur-ændringer

#### Frontend
- **React 18** med moderne hooks og suspense
- **ShadCN UI-komponenter** for konsistent design
- **Tailwind CSS** for vedligeholdelsesvenlig styling
- **TypeScript** for type-sikkerhed gennem hele applikationen

#### Backend
- **Express.js** server med moderne middleware
- **Session-håndtering** med PostgreSQL-opbevaring
- **RESTful API** design med konsistent fejlhåndtering
- **Environment-baseret konfiguration**

#### Deployment
- **Replit-native deployment** konfiguration
- **Automatisk build-pipeline** fra udvikling til produktion
- **Environment secrets** håndtering for sikkerhed

### 🎯 Brugerarbejdsgang

#### For BU-projekter
1. Opret projekt med type "BU"
2. Dokumentnummer udfyldes automatisk som "Bilag 2 til SAT NNPPV[dit nummer]"
3. PDF navngives automatisk som "[Projektnavn] BU SQP"

#### For HVAC-projekter
1. Opret projekt med type "HVAC"
2. Dokumentnummer udfyldes automatisk som "Bilag 3 til SAT NNPPV[dit nummer]"
3. PDF navngives automatisk som "[Projektnavn] HVAC SQP"

#### Edge Browser workflow
1. Klik på "Choose files" eller "Upload mappe" knappen
2. Vælg din første mappe
3. Upload den
4. Klik på "Upload mappe" igen for næste mappe
5. Gentag til alle mapper er uploadet

### 🔮 Kommende funktioner
- Brugerautentificering og roller
- Projekt-templates til gentagende opgaver
- Bulk-operations for store projekter
- Avanceret rapportering og analytics

---

**Note**: Denne version er fuldt kompatibel med eksisterende projekter og kræver ingen data-migration.