import { useState, useRef, ChangeEvent, useEffect } from "react";
import { FolderStructure } from "@/components/pdf/FolderStructure";
import { FolderData, FolderStructureType } from "@/lib/types";
import { generatePDF, processUploadedFiles } from "@/lib/pdfUtils";
import { FileText, Folder, File, FileOutput, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BuildingProjectDialog } from "@/components/BuildingProjectDialog";
import { EditBuildingProjectDialog } from "@/components/EditBuildingProjectDialog";
import { HelpDialog } from "@/components/HelpDialog";
import { useQuery } from "@tanstack/react-query";
import { BuildingProject } from "@shared/schema";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function PDFGenerator() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [folderStructure, setFolderStructure] = useState<FolderStructureType>({ sections: [] });
  const [pdfName, setPdfName] = useState<string>("samlet");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [documentNumberLeft, setDocumentNumberLeft] = useState<string>("");
  const [documentNumberCenter, setDocumentNumberCenter] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Query to fetch all building projects from the database
  const { data: buildingProjects, isLoading, refetch } = useQuery({
    queryKey: ['building-projects'],
    queryFn: async () => {
      const response = await fetch('/api/building-projects');
      if (!response.ok) {
        throw new Error('Failed to fetch building projects');
      }
      return response.json() as Promise<BuildingProject[]>;
    }
  });
  
  // Handle selecting a building project from the dropdown
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    
    if (projectId === "none") {
      // Reset fields if "Vælg anlæg" is selected
      setPdfName("samlet");
      setDocumentNumberLeft("");
      setDocumentNumberCenter("");
      return;
    }
    
    // Find the selected project
    const selectedProject = buildingProjects?.find(p => p.id.toString() === projectId);
    if (selectedProject) {
      // Fill in the form with project data
      setPdfName(selectedProject.pdfName);
      setDocumentNumberLeft(selectedProject.documentNumberLeft);
      setDocumentNumberCenter(selectedProject.documentNumberCenter);
    }
  };

  const handleCoverFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setCoverFile(file);
      } else {
        toast({
          title: "Forkert filformat",
          description: "Venligst vælg en PDF-fil som forside.",
          variant: "destructive"
        });
        e.target.value = "";
      }
    }
  };

  const handleFolderUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const structure = processUploadedFiles(files);
      setFolderStructure(structure);
    }
  };

  const clearCoverFile = () => {
    setCoverFile(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const clearFolderStructure = () => {
    setFolderStructure({ sections: [] });
    if (folderInputRef.current) {
      folderInputRef.current.value = "";
    }
  };

  const handleGeneratePDF = async () => {
    if (!folderStructure.sections.length) {
      toast({
        title: "Ingen mapper valgt",
        description: "Upload venligst en mappe med filer.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generatePDF(
        coverFile, 
        folderStructure, 
        pdfName, 
        documentNumberLeft,
        documentNumberCenter
      );
      toast({
        title: "PDF genereret",
        description: `${pdfName}.pdf er nu klar til download.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Fejl ved generering af PDF",
        description: "Der opstod en fejl under genereringen af PDF'en.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSectionVisibility = (sectionId: string, visible: boolean) => {
    setFolderStructure(prev => {
      const newStructure = { ...prev };
      const sectionIndex = newStructure.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex !== -1) {
        newStructure.sections[sectionIndex].showInToc = visible;
      }
      
      return newStructure;
    });
  };

  const updateSubpointVisibility = (sectionId: string, subpointId: string, visible: boolean) => {
    setFolderStructure(prev => {
      const newStructure = { ...prev };
      const sectionIndex = newStructure.sections.findIndex(s => s.id === sectionId);
      
      if (sectionIndex !== -1) {
        const subpointIndex = newStructure.sections[sectionIndex].subpoints.findIndex(
          sp => sp.id === subpointId
        );
        
        if (subpointIndex !== -1) {
          newStructure.sections[sectionIndex].subpoints[subpointIndex].showInToc = visible;
        }
      }
      
      return newStructure;
    });
  };

  return (
    <div className="min-h-screen bg-primary-1 text-primary-2 p-4 md:p-8 font-anton">
      <div className="max-w-5xl mx-auto bg-glass backdrop-blur-md rounded-xl border border-opacity-30 border-primary-2 p-6 md:p-10 shadow-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl">PDF Generator KS</h1>
          <HelpDialog />
        </div>
        
        {/* Cover Upload Section */}
        <div className="mb-6">
          <label className="block mb-2 font-bold">
            <span className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Upload forside (PDF):
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input 
              type="file" 
              id="coverInput" 
              ref={coverInputRef}
              accept="application/pdf"
              onChange={handleCoverFileChange}
              className="p-2 rounded-md w-full mb-2 md:mb-0 md:flex-1 bg-opacity-10 bg-white border border-accent-1" 
            />
            <button 
              className="btn-clear px-4 py-2 rounded-md text-sm bg-gradient-to-br from-accent-1 to-accent-2 border-2 border-primary-2 shadow-md hover:translate-y-[-1px] transition-transform duration-200"
              onClick={clearCoverFile}
              title="Ryd valgt forside"
            >
              Ryd filer
            </button>
          </div>
        </div>
        
        <hr className="border-accent-1 my-6" />
        
        {/* Folder Upload Section */}
        <div className="mb-6">
          <label className="block mb-2 font-bold">
            <span className="flex items-center">
              <Folder className="w-5 h-5 mr-2" />
              Upload mappe med punkter:
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input 
              type="file" 
              id="folderInput" 
              ref={folderInputRef}
              // @ts-ignore - webkitdirectory exists but is not in TypeScript definitions
              webkitdirectory="true"
              directory=""
              multiple
              onChange={handleFolderUpload}
              className="p-2 rounded-md w-full mb-2 md:mb-0 md:flex-1 bg-opacity-10 bg-white border border-accent-1" 
            />
            <button 
              className="btn-clear px-4 py-2 rounded-md text-sm bg-gradient-to-br from-accent-1 to-accent-2 border-2 border-primary-2 shadow-md hover:translate-y-[-1px] transition-transform duration-200"
              onClick={clearFolderStructure}
              title="Ryd valgte mapper"
            >
              Ryd mapper
            </button>
          </div>
        </div>
        
        {/* Folder Structure Preview */}
        <FolderStructure 
          folderStructure={folderStructure} 
          updateSectionVisibility={updateSectionVisibility}
          updateSubpointVisibility={updateSubpointVisibility}
        />
        
        <hr className="border-accent-1 my-6" />
        
        {/* Building Project Selection */}
        <div className="mb-6">
          <label className="block mb-2 font-bold flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Vælg anlæg:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedProjectId} onValueChange={handleProjectChange}>
              <SelectTrigger className="bg-opacity-10 bg-white border-accent-1 flex-grow">
                <SelectValue placeholder="Vælg et anlægsnummer" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-accent-1">
                <SelectItem value="none">Vælg anlæg...</SelectItem>
                {buildingProjects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <BuildingProjectDialog onProjectAdded={refetch} />
            
            {/* Show Edit button only when a project is selected */}
            {selectedProjectId && selectedProjectId !== "none" && buildingProjects && (
              <EditBuildingProjectDialog 
                project={buildingProjects.find(p => p.id.toString() === selectedProjectId)!} 
                onProjectUpdated={refetch} 
              />
            )}
          </div>
        </div>
        
        {/* PDF Name Input */}
        <div className="mb-6">
          <label htmlFor="pdfNameInput" className="block mb-2 font-bold flex items-center">
            <File className="w-5 h-5 mr-2" />
            Navn på PDF (uden .pdf):
          </label>
          <input 
            type="text" 
            id="pdfNameInput" 
            value={pdfName}
            onChange={(e) => setPdfName(e.target.value)}
            className="p-2 rounded-md w-full bg-opacity-10 bg-white border border-accent-1" 
          />
        </div>
        
        {/* Document Number Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left Document Number */}
          <div>
            <label htmlFor="documentNumberLeft" className="block mb-2 font-bold flex items-center">
              <File className="w-5 h-5 mr-2" />
              Dokumentnummer (venstre side):
            </label>
            <input 
              type="text" 
              id="documentNumberLeft" 
              value={documentNumberLeft}
              onChange={(e) => setDocumentNumberLeft(e.target.value)}
              className="p-2 rounded-md w-full bg-opacity-10 bg-white border border-accent-1" 
              placeholder="Vises i toppen til venstre"
            />
          </div>
          
          {/* Center Document Number */}
          <div>
            <label htmlFor="documentNumberCenter" className="block mb-2 font-bold flex items-center">
              <File className="w-5 h-5 mr-2" />
              Dokumentnummer (centreret):
            </label>
            <input 
              type="text" 
              id="documentNumberCenter" 
              value={documentNumberCenter}
              onChange={(e) => setDocumentNumberCenter(e.target.value)}
              className="p-2 rounded-md w-full bg-opacity-10 bg-white border border-accent-1" 
              placeholder="Vises i toppen i midten"
            />
          </div>
        </div>
        
        {/* Generate Button */}
        <div className="text-center">
          <button 
            id="generatePDF" 
            className="bg-gradient-to-br from-accent-1 to-accent-2 px-8 py-3 rounded-lg font-bold text-white flex items-center mx-auto border-2 border-primary-2 shadow-md text-shadow hover:translate-y-[-1px] transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGeneratePDF}
            disabled={isGenerating || folderStructure.sections.length === 0}
          >
            <FileOutput className="w-5 h-5 mr-2" />
            {isGenerating ? "Genererer..." : "Generér samlet PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
