import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { BuildingProject } from "@shared/schema";

interface BuildingProjectDialogProps {
  onProjectAdded: () => void;
}

export function BuildingProjectDialog({ onProjectAdded }: BuildingProjectDialogProps) {
  const [name, setName] = useState("");
  const [documentNumberLeft, setDocumentNumberLeft] = useState("");
  const [documentNumberCenter, setDocumentNumberCenter] = useState("");
  const [projectType, setProjectType] = useState<"HVAC" | "BU">("HVAC");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  
  const resetForm = () => {
    setName("");
    setDocumentNumberLeft("");
    setDocumentNumberCenter("");
    setProjectType("HVAC");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      toast({
        title: "Manglende information",
        description: "Anlægsnavn er påkrævet.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add project type prefix to name
      const projectName = `${projectType} ${name}`;
      
      // Auto-generate PDF name: [name] [projectType] SQP
      const generatedPdfName = `${name} ${projectType} SQP`;
      
      // Format document number left based on project type
      const formattedDocNumberLeft = projectType === "HVAC" 
        ? `Bilag 3 til SAT ${documentNumberLeft}`
        : `Bilag 2 til SAT ${documentNumberLeft}`;
      
      const newProject = {
        name: projectName,
        pdfName: generatedPdfName,
        documentNumberLeft: formattedDocNumberLeft,
        documentNumberCenter,
        projectType
      };
      
      const response = await fetch("/api/building-projects", {
        method: "POST",
        body: JSON.stringify(newProject),
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      toast({
        title: "Anlæg oprettet",
        description: `${name} er blevet tilføjet til databasen.`
      });
      
      resetForm();
      setIsOpen(false);
      onProjectAdded();
    } catch (error) {
      console.error("Error creating building project:", error);
      toast({
        title: "Fejl",
        description: "Der opstod en fejl under oprettelsen af anlægget.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-btn px-4 py-2 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tilføj nyt anlæg
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border border-accent-1 text-primary-2">
        <DialogHeader>
          <DialogTitle>Tilføj nyt anlæg</DialogTitle>
          <DialogDescription>
            Udfyld information om det nye byggeprojekt/anlæg nedenfor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="projectType">Projekttype</Label>
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
            <Label htmlFor="name">Anlægsnavn</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="f.eks. KA 1007 01"
              className="bg-opacity-10 bg-white border-accent-1"
            />
            {name && (
              <p className="text-sm text-gray-400">
                PDF navn: {name} {projectType} SQP
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentNumberLeft">Dokument nummer (efter SAT)</Label>
            <Input
              id="documentNumberLeft"
              value={documentNumberLeft}
              onChange={(e) => setDocumentNumberLeft(e.target.value)}
              placeholder={`Tilføjes efter "Bilag ${projectType === "HVAC" ? "3" : "2"} til SAT "`}
              className="bg-opacity-10 bg-white border-accent-1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentNumberCenter">Dokumentnummer (højre side)</Label>
            <Input
              id="documentNumberCenter"
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
              {isLoading ? "Gemmer..." : "Gem anlæg"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}