import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import type { MemoryRecord, RetrievedChunk, StoredMemoryRecord } from './memory.types.js';

@Injectable()
export class MemoryService {
  private supabase: SupabaseClient;
  private ai: GoogleGenAI;

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      this.config.get<string>('supabase.url')!,
      this.config.get<string>('supabase.serviceKey')!,
    );
    this.ai = new GoogleGenAI({ apiKey: this.config.get<string>('google.apiKey')! });
  }

  private async embedForStorage(text: string): Promise<number[]> {
    const response = await this.ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: [text],
      config: {
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: 768,
      },
    });
    return response.embeddings![0].values!;
  }

  private async embedForQuery(text: string): Promise<number[]> {
    const response = await this.ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: [text],
      config: {
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: 768,
      },
    });
    return response.embeddings![0].values!;
  }

  async store(record: MemoryRecord): Promise<void> {
    const embedding = await this.embedForStorage(record.content);
    const { error } = await this.supabase.from('agent_memories').insert({
      agent: record.agent,
      type: record.type,
      content: record.content,
      embedding,
      domain: record.domain ?? null,
      outcome: record.outcome ?? null,
      confidence: record.confidence ?? null,
    });

    if (error) {
      throw new Error(`Failed to store memory: ${error.message}`);
    }
  }

  async list(domain?: string): Promise<StoredMemoryRecord[]> {
    let query = this.supabase
      .from('agent_memories')
      .select('id, agent, type, content, domain, outcome, confidence, created_at')
      .order('created_at', { ascending: false });

    if (domain) {
      query = query.eq('domain', domain);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to list memories: ${error.message}`);
    }

    return (data ?? []).map((row: any) => ({
      id: row.id,
      agent: row.agent,
      type: row.type,
      content: row.content,
      domain: row.domain,
      outcome: row.outcome,
      confidence: row.confidence,
      createdAt: row.created_at,
    }));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('agent_memories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete memory: ${error.message}`);
    }
  }

  async update(id: string, content: string): Promise<void> {
    const embedding = await this.embedForStorage(content);
    const { error } = await this.supabase
      .from('agent_memories')
      .update({ content, embedding })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update memory: ${error.message}`);
    }
  }

  async stats(): Promise<{ total: number; byDomain: Record<string, number>; byType: Record<string, number> }> {
    const { data, error } = await this.supabase
      .from('agent_memories')
      .select('domain, type');

    if (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }

    const rows = data ?? [];
    const byDomain: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const row of rows) {
      const d = row.domain ?? 'uncategorized';
      byDomain[d] = (byDomain[d] ?? 0) + 1;
      byType[row.type] = (byType[row.type] ?? 0) + 1;
    }

    return { total: rows.length, byDomain, byType };
  }

  async retrieve(query: string, agent: string, topK = 5): Promise<RetrievedChunk[]> {
    const queryEmbedding = await this.embedForQuery(query);

    const { data, error } = await this.supabase.rpc('match_agent_memories', {
      query_embedding: queryEmbedding,
      match_agent: agent,
      match_count: topK,
      similarity_threshold: 0.7,
    });

    if (error) {
      throw new Error(`Failed to retrieve memories: ${error.message}`);
    }

    return (data ?? []).map((row: { content: string; similarity: number; agent: string; type: string; created_at: string }) => ({
      content: row.content,
      similarity: row.similarity,
      agent: row.agent,
      type: row.type as RetrievedChunk['type'],
      createdAt: row.created_at,
    }));
  }
}
