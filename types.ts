
export interface Chunk {
  id: string;
  text: string;
  score: number;
  fileName: string;
  pageNumber: number;
}

export interface FileData {
  name: string;
  type: 'pdf' | 'image';
  preview?: string;
  raw?: File;
  chunks?: Chunk[];
  stats?: {
    chunkCount: number;
    wordCount: number;
  };
}

export interface SearchResult {
  answer: string;
  sources: Chunk[];
  query: string;
  verifiedFacts: string[];
  confidence: 'High' | 'Medium' | 'Low';
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING_FILES = 'PROCESSING_FILES',
  SEARCHING = 'SEARCHING',
  ERROR = 'ERROR'
}
