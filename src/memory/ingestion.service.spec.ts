import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service.js';
import { MemoryService } from './memory.service.js';
import { OrayzenClient } from '../orayzen/orayzen.client.js';

describe('IngestionService', () => {
  let service: IngestionService;
  let memoryService: jest.Mocked<MemoryService>;
  let orayzenClient: jest.Mocked<OrayzenClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: MemoryService,
          useValue: { store: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: OrayzenClient,
          useValue: {
            getGoals: jest.fn().mockResolvedValue([
              { id: '1', title: 'Reach $1M ARR', status: 'in_progress', progress: 45 },
            ]),
            getKpis: jest.fn().mockResolvedValue([]),
            getInitiatives: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    memoryService = module.get(MemoryService);
    orayzenClient = module.get(OrayzenClient);
  });

  it('seedCompanyKnowledge() stores all goals as semantic memories', async () => {
    await service.seedCompanyKnowledge();

    expect(orayzenClient.getGoals).toHaveBeenCalled();
    expect(memoryService.store).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'semantic',
        content: expect.stringContaining('Reach $1M ARR'),
      }),
    );
  });
});
