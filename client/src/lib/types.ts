export interface SubpointType {
  id: string;
  title: string;
  files: File[];
  showInToc: boolean;
}

export interface SectionType {
  id: string;
  title: string;
  files: File[];
  subpoints: SubpointType[];
  showInToc: boolean;
}

export interface FolderStructureType {
  sections: SectionType[];
}

export interface FolderData {
  path: string;
  files: File[];
}
