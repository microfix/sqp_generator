import React from "react";
import { Subpoint } from "./Subpoint";
import { SectionType } from "@/lib/types";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SectionProps {
  section: SectionType;
  updateSectionVisibility: (sectionId: string, visible: boolean) => void;
  updateSubpointVisibility: (sectionId: string, subpointId: string, visible: boolean) => void;
  isDraggable?: boolean;
  level?: number;
}

export const Section: React.FC<SectionProps> = ({ 
  section, 
  updateSectionVisibility,
  updateSubpointVisibility,
  isDraggable = false,
  level = 0
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: section.id,
    disabled: !isDraggable || level > 0 // Only allow dragging main sections
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const indent = level * 20;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`folder-section p-4 rounded-md border border-accent-1 bg-black bg-opacity-70 transition-transform duration-200 ${
        isDragging ? 'z-50' : 'hover:translate-x-1'
      }`}
      {...attributes}
    >
      <div className="flex items-center mb-3">
        {isDraggable && level === 0 && (
          <div 
            className="cursor-grab active:cursor-grabbing mr-2 p-1 hover:bg-accent-1 hover:bg-opacity-20 rounded"
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-accent-1" />
          </div>
        )}
        <h3 className={`font-bold mr-3 m-0 ${level === 0 ? 'text-xl' : 'text-lg'}`} style={{ marginLeft: `${indent}px` }}>
          {section.title}
        </h3>
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
            <Section
              key={subpoint.id}
              section={subpoint as SectionType}
              updateSectionVisibility={updateSectionVisibility}
              updateSubpointVisibility={updateSubpointVisibility}
              isDraggable={false} // Subpoints are not draggable across main sections
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
