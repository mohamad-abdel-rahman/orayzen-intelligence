export type MemoryType = 'episodic' | 'semantic' | 'procedural';
export type MemoryOutcome = 'approved' | 'rejected' | 'auto_executed' | null;

export interface MemoryRecord {
  agent: string;
  type: MemoryType;
  content: string;
  domain?: string;
  outcome?: MemoryOutcome;
  confidence?: number;
}

export interface StoredMemoryRecord extends MemoryRecord {
  id: string;
  createdAt: string;
}

export interface RetrievedChunk {
  content: string;
  similarity: number;
  agent: string;
  type: MemoryType;
  createdAt: string;
}
