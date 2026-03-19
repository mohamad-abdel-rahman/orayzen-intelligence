import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MemoryService } from './memory.service.js';

const mockSupabaseInsert = jest.fn().mockResolvedValue({ error: null });
const mockSupabaseRpc = jest.fn().mockResolvedValue({
  data: [
    { content: 'Past decision about bottleneck', similarity: 0.91, agent: 'ceo', type: 'episodic', created_at: '2026-03-01T00:00:00Z' },
  ],
  error: null,
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: mockSupabaseInsert,
    })),
    rpc: mockSupabaseRpc,
  })),
}));

const mockEmbedContent = jest.fn().mockResolvedValue({
  embeddings: [{ values: new Array(768).fill(0.1) }],
});

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: {
      embedContent: mockEmbedContent,
    },
  })),
}));

describe('MemoryService', () => {
  let service: MemoryService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const config: Record<string, string> = {
                'supabase.url': 'https://test.supabase.co',
                'supabase.serviceKey': 'test-key',
                'google.apiKey': 'AIza-test',
              };
              return config[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get<MemoryService>(MemoryService);
  });

  it('store() embeds content with RETRIEVAL_DOCUMENT task type and inserts into Supabase', async () => {
    await service.store({
      agent: 'ceo',
      type: 'episodic',
      content: 'CEO Agent flagged a bottleneck.',
      domain: 'strategy',
      confidence: 85,
      outcome: 'auto_executed',
    });

    expect(mockEmbedContent).toHaveBeenCalledWith({
      model: 'gemini-embedding-2-preview',
      contents: ['CEO Agent flagged a bottleneck.'],
      config: {
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: 768,
      },
    });
    expect(mockSupabaseInsert).toHaveBeenCalled();
  });

  it('retrieve() embeds query with RETRIEVAL_QUERY task type and returns chunks', async () => {
    const chunks = await service.retrieve('bottleneck in pipeline', 'ceo', 3);

    expect(mockEmbedContent).toHaveBeenCalledWith({
      model: 'gemini-embedding-2-preview',
      contents: ['bottleneck in pipeline'],
      config: {
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: 768,
      },
    });
    expect(mockSupabaseRpc).toHaveBeenCalled();
    expect(chunks).toHaveLength(1);
    expect(chunks[0].similarity).toBeGreaterThan(0.9);
  });
});
