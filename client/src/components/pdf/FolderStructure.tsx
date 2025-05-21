import React from "react";
import { Section } from "./Section";
import { FolderStructureType } from "@/lib/types";

interface FolderStructureProps {
  folderStructure: FolderStructureType;
  updateSectionVisibility: (sectionId: string, visible: boolean) => void;
  updateSubpointVisibility: (sectionId: string, subpointId: string, visible: boolean) => void;
}

export const FolderStructure: React.FC<FolderStructureProps> = ({
  folderStructure,
  updateSectionVisibility,
  updateSubpointVisibility
}) => {
  if (folderStructure.sections.length === 0) {
    return (
      <div className="my-6 p-4 rounded-md border border-accent-1 bg-opacity-50 bg-black min-h-[100px]">
        <p className="text-center opacity-70">Ingen mapper uploadet. Upload en mappe for at se strukturen her.</p>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 rounded-md border border-accent-1 bg-opacity-50 bg-black min-h-[100px]">
      <div className="folder-structure space-y-4">
        {folderStructure.sections.map((section) => (
          <Section 
            key={section.id}
            section={section}
            updateSectionVisibility={updateSectionVisibility}
            updateSubpointVisibility={updateSubpointVisibility}
          />
        ))}
      </div>
    </div>
  );
};
