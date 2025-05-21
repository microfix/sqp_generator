import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, FileDown, FolderOpen, Database, FilePlus2 } from "lucide-react";
import { useState } from "react";

export function HelpDialog() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="px-4 py-2 border-accent-1 text-primary-2 ml-auto">
          <HelpCircle className="h-4 w-4 mr-2" />
          Hjælp
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border border-accent-1 text-primary-2 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Hjælp til PDF Generator</DialogTitle>
          <DialogDescription>
            Her er en guide til, hvordan du bruger PDF Generator programmet.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-2">
          <section>
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <Database className="w-5 h-5 mr-2 text-accent-1" />
              Administrer anlæg
            </h3>
            <ol className="list-decimal ml-6 space-y-2">
              <li>
                <strong>Opret et nyt anlæg:</strong> Klik på "Tilføj nyt anlæg" knappen og udfyld formularen med anlægsnavn, PDF-navn og dokumentnumre.
              </li>
              <li>
                <strong>Vælg et anlæg:</strong> Brug dropdown-menuen til at vælge et eksisterende anlæg. Dette vil automatisk udfylde PDF-navn og dokumentnumre.
              </li>
              <li>
                <strong>Rediger et anlæg:</strong> Efter at have valgt et anlæg, brug "Rediger anlæg" knappen for at rette i informationen.
              </li>
            </ol>
          </section>
          
          <section>
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <FolderOpen className="w-5 h-5 mr-2 text-accent-1" />
              Upload af filer
            </h3>
            <ol className="list-decimal ml-6 space-y-2">
              <li>
                <strong>Upload forside:</strong> Vælg en PDF-fil som forside ved at klikke på "Upload forside (PDF)" inputfeltet.
              </li>
              <li>
                <strong>Upload mappe med punkter:</strong> Vælg en mappe med dine PDF- og JPEG-filer ved at klikke på "Upload mappe med punkter" inputfeltet.
              </li>
              <li>
                <strong>Mappestruktur:</strong> Programmet organiserer automatisk dine filer baseret på mappernes struktur:
                <ul className="list-disc ml-6 mt-1">
                  <li>Hovedmapper bliver til sektioner</li>
                  <li>Undermapper bliver til undersektioner</li>
                  <li>Filer i hver mappe tilføjes til deres respektive sektioner</li>
                </ul>
              </li>
            </ol>
          </section>
          
          <section>
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <FilePlus2 className="w-5 h-5 mr-2 text-accent-1" />
              Tilpas indholdsfortegnelse
            </h3>
            <ol className="list-decimal ml-6 space-y-2">
              <li>
                <strong>Indstil sidetalsvisning:</strong> For hver sektion og undersektion kan du vælge, om sidetallet skal vises i indholdsfortegnelsen ved at bruge checkboksen.
              </li>
              <li>
                <strong>Organisering:</strong> Sektioner og undersektioner vises i alfabetisk rækkefølge i indholdsfortegnelsen.
              </li>
            </ol>
          </section>
          
          <section>
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <FileDown className="w-5 h-5 mr-2 text-accent-1" />
              Generer og download PDF
            </h3>
            <ol className="list-decimal ml-6 space-y-2">
              <li>
                <strong>Kontroller PDF-navn:</strong> Sørg for at PDF-navnet er korrekt indstillet. Dette navn vil blive brugt som filnavn for den genererede PDF.
              </li>
              <li>
                <strong>Dokumentnumre:</strong> Dokumentnumrene vil vises i header-området på hver side - ét i venstre side og ét centreret.
              </li>
              <li>
                <strong>Sidenumre:</strong> Sidenumre i formatet "Page X of Y" vises automatisk i bunden af hver side.
              </li>
              <li>
                <strong>Generer PDF:</strong> Klik på "Generér samlet PDF" knappen for at kombinere alle dine filer til en samlet PDF med indholdsfortegnelse.
              </li>
              <li>
                <strong>Download:</strong> Efter genereringen vil browseren automatisk downloade den samlede PDF.
              </li>
            </ol>
          </section>
          
          <section>
            <h3 className="text-xl font-bold mb-2">Gode råd og tips</h3>
            <ul className="list-disc ml-6 space-y-2">
              <li>
                <strong>Filtyper:</strong> Programmet understøtter kun PDF- og JPEG-filer. Andre filtyper vil blive ignoreret.
              </li>
              <li>
                <strong>Mappestruktur:</strong> For bedste resultater, organiser dine filer i en logisk mappestruktur med hovedmapper og undermapper.
              </li>
              <li>
                <strong>Konsistent navngivning:</strong> Brug konsistente navne for dine mapper og filer for at gøre indholdsfortegnelsen mere læselig.
              </li>
              <li>
                <strong>Gem ofte brugte anlæg:</strong> Brug databasen til at gemme anlæg, du ofte arbejder med, så du ikke skal genindtaste informationen hver gang.
              </li>
            </ul>
          </section>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            className="gradient-btn"
            onClick={() => setIsOpen(false)}
          >
            Luk guide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}