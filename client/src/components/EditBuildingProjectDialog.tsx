import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { BuildingProject } from "@shared/schema";

interface EditBuildingProjectDialogProps {
  project: BuildingProject;
  onProjectUpdated: () => void;
}

export function EditBuildingProjectDialog({ project, onProjectUpdated }: EditBuildingProjectDialogProps) {
  const [name, setName] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [documentNumberLeft, setDocumentNumberLeft] = useState("");
  const [documentNumberCenter, setDocumentNumberCenter] = useState("");
  const [projectType, setProjectType] = useState<"HVAC" | "BU">("HVAC");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  
  // Initialize form with project data when dialog opens
  useEffect(() => {
    if (isOpen && project) {
      // Extract project type and name without prefix
      const projectTypeFromName = project.name.startsWith("HVAC ") ? "HVAC" : 
                                 project.name.startsWith("BU ") ? "BU" : "HVAC";
      const nameWithoutPrefix = project.name.replace(/^(HVAC |BU )/, "");
      
      // Extract document number without prefix
      const docNumberLeft = project.documentNumberLeft.replace(/^Bilag [23] til SAT /, "");
      
      setName(nameWithoutPrefix);
      setPdfName(project.pdfName);
      setDocumentNumberLeft(docNumberLeft);
      setDocumentNumberCenter(project.documentNumberCenter);
      setProjectType((project.projectType as "HVAC" | "BU") || projectTypeFromName);
    }
  }, [isOpen, project]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim() || !pdfName.trim()) {
      toast({
        title: "Manglende information",
        description: "Anlægsnavn og PDF-navn er påkrævet.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add project type prefix to name
      const projectName = `${projectType} ${name}`;
      
      // Format document number left based on project type
      const formattedDocNumberLeft = projectType === "HVAC" 
        ? `Bilag 3 til SAT ${documentNumberLeft}`
        : `Bilag 2 til SAT ${documentNumberLeft}`;
      
      const updatedProject = {
        name: projectName,
        pdfName,
        documentNumberLeft: formattedDocNumberLeft,
        documentNumberCenter,
        projectType
      };
      
      const response = await fetch(`/api/building-projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify(updatedProject),
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      toast({
        title: "Anlæg opdateret",
        description: `${name} er blevet opdateret.`
      });
      
      setIsOpen(false);
      onProjectUpdated();
    } catch (error) {
      console.error("Error updating building project:", error);
      toast({
        title: "Fejl",
        description: "Der opstod en fejl under opdateringen af anlægget.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2 px-2 py-2 border-accent-1 text-primary-2">
          <Pencil className="h-4 w-4" />
          Rediger anlæg
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border border-accent-1 text-primary-2">
        <DialogHeader>
          <DialogTitle>Rediger anlæg</DialogTitle>
          <DialogDescription>
            Ret information om anlægget nedenfor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-projectType">Projekttype</Label>
            <Select value={projectType} onValueChange={(value: "HVAC" | "BU") => setProjectType(value)}>
              <SelectTrigger className="bg-opacity-10 bg-white border-accent-1">
                <SelectValue placeholder="Vælg projekttype" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HVAC">HVAC</SelectItem>
                <SelectItem value="BU">BU</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-name">Anlægsnavn</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Indtast anlæggets navn (uden HVAC/BU prefix)"
              className="bg-opacity-10 bg-white border-accent-1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-pdfName">PDF Navn (uden .pdf)</Label>
            <Input
              id="edit-pdfName"
              value={pdfName}
              onChange={(e) => setPdfName(e.target.value)}
              placeholder="Indtast navnet på PDF-filen"
              className="bg-opacity-10 bg-white border-accent-1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-documentNumberLeft">Dokument nummer (efter SAT)</Label>
            <Input
              id="edit-documentNumberLeft"
              value={documentNumberLeft}
              onChange={(e) => setDocumentNumberLeft(e.target.value)}
              placeholder={`Tilføjes efter "Bilag ${projectType === "HVAC" ? "3" : "2"} til SAT "`}
              className="bg-opacity-10 bg-white border-accent-1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-documentNumberCenter">Dokumentnummer (højre side)</Label>
            <Input
              id="edit-documentNumberCenter"
              value={documentNumberCenter}
              onChange={(e) => setDocumentNumberCenter(e.target.value)}
              placeholder="Dokumentnummer til højre i header"
              className="bg-opacity-10 bg-white border-accent-1"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-accent-1 text-primary-2"
            >
              Annuller
            </Button>
            <Button 
              type="submit" 
              className="gradient-btn"
              disabled={isLoading}
            >
              {isLoading ? "Gemmer..." : "Gem ændringer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}