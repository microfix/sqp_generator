import React from "react";
import { Section } from "./Section";
import { FolderStructureType } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface FolderStructureProps {
  folderStructure: FolderStructureType;
  updateSectionVisibility: (sectionId: string, visible: boolean) => void;
  updateSubpointVisibility: (sectionId: string, subpointId: string, visible: boolean) => void;
  onReorderSections?: (newStructure: FolderStructureType) => void;
  onReorderSubpoints?: (sectionId: string, newSubpoints: any[]) => void;
}

export const FolderStructure: React.FC<FolderStructureProps> = ({
  folderStructure,
  updateSectionVisibility,
  updateSubpointVisibility,
  onReorderSections,
  onReorderSubpoints
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && onReorderSections) {
      const oldIndex = folderStructure.sections.findIndex(section => section.id === active.id);
      const newIndex = folderStructure.sections.findIndex(section => section.id === over?.id);

      const newSections = arrayMove(folderStructure.sections, oldIndex, newIndex);
      const newStructure = { ...folderStructure, sections: newSections };
      onReorderSections(newStructure);
    }
  };

  if (folderStructure.sections.length === 0) {
    return (
      <div className="my-6 p-4 rounded-md border border-accent-1 bg-opacity-50 bg-black min-h-[100px]">
        <p className="text-center opacity-70">Ingen mapper uploadet. Upload en mappe for at se strukturen her.</p>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 rounded-md border border-accent-1 bg-opacity-50 bg-black min-h-[100px]">
      <div className="mb-3 text-sm text-yellow-400 bg-yellow-900 bg-opacity-20 p-2 rounded">
        <strong>Træk og slip:</strong> Træk hovedmapper op/ned for at ændre rækkefølge
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={folderStructure.sections.map(s => s.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="folder-structure space-y-4">
            {folderStructure.sections.map((section) => (
              <Section 
                key={section.id}
                section={section}
                updateSectionVisibility={updateSectionVisibility}
                updateSubpointVisibility={updateSubpointVisibility}
                isDraggable={true}
                onReorderSubpoints={onReorderSubpoints}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
