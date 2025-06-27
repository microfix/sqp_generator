export interface SubpointType {
  id: string;
  title: string;
  files: File[];
  subpoints: SubpointType[]; // Recursive - subpoints can have their own subpoints
  showInToc: boolean;
  level?: number; // Track nesting level for formatting
}

export interface SectionType {
  id: string;
  title: string;
  files: File[];
  subpoints: SubpointType[];
  showInToc: boolean;
  level?: number; // Track nesting level for formatting
}

export interface FolderStructureType {
  sections: SectionType[];
}

export interface FolderData {
  path: string;
  files: File[];
}
