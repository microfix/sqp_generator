# PDF Generator KS

Dette er et simpelt, statisk webapp projekt til generering af en samlet PDF-rapport med indholdsfortegnelse (TOC) baseret på en dynamisk opbygget struktur, hvor brugeren manuelt tilføjer punkter og underpunkter med tilhørende filer (PDF og JPG).

## Funktionaliteter

- **Manuel tilføjelse af punkter:** Brugeren kan tilføje hovedpunkter samt underpunkter. Hvert punkt kan få tilknyttet én eller flere filer.
- **Forsideupload:** Upload af en forside PDF, der indlejres forrest i den samlede PDF.
- **Filudvælgelse:** Til hver sektion og undersektion vælges filer der skal integreres i PDF'ens rækkefølge.
- **TOC med klikbare links:** Systemet genererer en indholdsfortegnelse (TOC) med sidehenvisninger og klikbare links, der navigerer til de relevante sektioner i PDF'en.
- **PDF-sammensætning:** Brug af pdf-lib biblioteket, via en CDN, til at kombinere PDF'er og konvertere JPG'er til PDF sider gennem canvas.
- **Fejlhåndtering:** Basis fejlhåndtering for ugyldige filformater og manglende input.

## Filoversigt

- `pdf_KS.html`: Hovedfilen indeholder hele webapplikationen med HTML, CSS og JavaScript-kode.
- `README.md`: Denne fil med vejledning og dokumentation.

## Brug

1. Upload en forside PDF via forsidefeltet.
2. Tilføj et nyt punkt ved at klikke på "Tilfør punkt".
3. Angiv titel og vælg filer (PDF eller JPG) til det tilføjede punkt.
4. Tilføj underpunkter efter behov ved at klikke på "Tilfør underpunkt" under et eksisterende punkt.
5. Klik "Generér samlet PDF" for at skabe og downloade den samlede PDF med indholdsfortegnelse.

## Hosting

Dette er et statisk webapp, og filen `pdf_KS.html` kan hostes direkte via GitHub Pages eller en hvilken som helst anden statisk hostingsløsning.

## Bemærkninger

- Koden benytter [pdf-lib](https://github.com/Hopding/pdf-lib) fra en CDN.
- Funktionaliteten er testet i nyere browsere og kræver moderne JavaScript understøttelse.
- Hvis du finder fejl, se konsollen for fejlmeddelelser og debug som nødvendigt.
