import React from "react";
import { SubpointType } from "@/lib/types";

interface SubpointProps {
  subpoint: SubpointType;
  sectionId: string;
  updateSubpointVisibility: (sectionId: string, subpointId: string, visible: boolean) => void;
}

export const Subpoint: React.FC<SubpointProps> = ({ 
  subpoint, 
  sectionId,
  updateSubpointVisibility 
}) => {
  return (
    <div className="folder-subpoint p-3 rounded-md border-l-4 border-accent-2 bg-black bg-opacity-70">
      <div className="flex items-center mb-2">
        <h4 className="text-lg font-medium mr-3 m-0">{subpoint.title}</h4>
        <input
          type="checkbox"
          id={`show-pages-${subpoint.id}`}
          className="w-4 h-4 accent-accent-1"
          checked={subpoint.showInToc !== false}
          onChange={(e) => updateSubpointVisibility(sectionId, subpoint.id, e.target.checked)}
        />
        <label htmlFor={`show-pages-${subpoint.id}`} className="ml-2 text-sm">
          Vis sidetal
        </label>
      </div>

      <p className="text-sm">
        Filer: {subpoint.files.length} fil(er)
      </p>
    </div>
  );
};
