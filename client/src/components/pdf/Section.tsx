import React from "react";
import { Subpoint } from "./Subpoint";
import { SectionType } from "@/lib/types";

interface SectionProps {
  section: SectionType;
  updateSectionVisibility: (sectionId: string, visible: boolean) => void;
  updateSubpointVisibility: (sectionId: string, subpointId: string, visible: boolean) => void;
}

export const Section: React.FC<SectionProps> = ({ 
  section, 
  updateSectionVisibility,
  updateSubpointVisibility 
}) => {
  return (
    <div className="folder-section p-4 rounded-md border border-accent-1 bg-black bg-opacity-70 hover:translate-x-1 transition-transform duration-200">
      <div className="flex items-center mb-3">
        <h3 className="text-xl font-bold mr-3 m-0">{section.title}</h3>
        <input
          type="checkbox"
          id={`show-pages-${section.id}`}
          className="w-4 h-4 accent-accent-1"
          checked={section.showInToc !== false}
          onChange={(e) => updateSectionVisibility(section.id, e.target.checked)}
        />
        <label htmlFor={`show-pages-${section.id}`} className="ml-2 text-sm">
          Vis sidetal i indholdsfortegnelsen
        </label>
      </div>

      {section.files.length > 0 && (
        <p className="text-sm mb-3">
          <strong>Filer direkte i mappen:</strong> {section.files.length} fil(er)
        </p>
      )}

      {section.subpoints.length > 0 && (
        <div className="ml-6 space-y-3">
          {section.subpoints.map((subpoint) => (
            <Subpoint
              key={subpoint.id}
              subpoint={subpoint}
              sectionId={section.id}
              updateSubpointVisibility={updateSubpointVisibility}
            />
          ))}
        </div>
      )}
    </div>
  );
};
