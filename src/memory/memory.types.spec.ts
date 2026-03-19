import type { MemoryRecord, MemoryType, RetrievedChunk } from './memory.types.js';

describe('MemoryTypes', () => {
  it('MemoryRecord has required fields', () => {
    const record: MemoryRecord = {
      agent: 'ceo',
      type: 'episodic',
      content: 'On March 15 CEO Agent flagged a bottleneck in the sales pipeline.',
      domain: 'strategy',
      outcome: 'auto_executed',
      confidence: 85,
    };
    expect(record.agent).toBe('ceo');
    expect(record.type).toBe('episodic');
  });

  it('RetrievedChunk has content and similarity score', () => {
    const chunk: RetrievedChunk = {
      content: 'Previous analysis showed bottleneck resolved in 2 weeks.',
      similarity: 0.92,
      agent: 'ceo',
      type: 'episodic',
      createdAt: '2026-03-15T08:00:00Z',
    };
    expect(chunk.similarity).toBeGreaterThan(0.9);
  });
});
