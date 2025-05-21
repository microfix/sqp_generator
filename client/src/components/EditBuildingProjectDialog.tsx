import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  
  // Initialize form with project data when dialog opens
  useEffect(() => {
    if (isOpen && project) {
      setName(project.name);
      setPdfName(project.pdfName);
      setDocumentNumberLeft(project.documentNumberLeft);
      setDocumentNumberCenter(project.documentNumberCenter);
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
      const updatedProject = {
        name,
        pdfName,
        documentNumberLeft,
        documentNumberCenter
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
            <Label htmlFor="name">Anlægsnavn</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Indtast anlæggets navn"
              className="bg-opacity-10 bg-white border-accent-1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pdfName">PDF Navn (uden .pdf)</Label>
            <Input
              id="pdfName"
              value={pdfName}
              onChange={(e) => setPdfName(e.target.value)}
              placeholder="Indtast navnet på PDF-filen"
              className="bg-opacity-10 bg-white border-accent-1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentNumberLeft">Dokumentnummer (venstre side)</Label>
            <Input
              id="documentNumberLeft"
              value={documentNumberLeft}
              onChange={(e) => setDocumentNumberLeft(e.target.value)}
              placeholder="Dokumentnummer til venstre i header"
              className="bg-opacity-10 bg-white border-accent-1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="documentNumberCenter">Dokumentnummer (centreret)</Label>
            <Input
              id="documentNumberCenter"
              value={documentNumberCenter}
              onChange={(e) => setDocumentNumberCenter(e.target.value)}
              placeholder="Dokumentnummer centreret i header"
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