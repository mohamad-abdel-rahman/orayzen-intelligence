import { Injectable, Logger } from '@nestjs/common';
import { MemoryService } from './memory.service.js';
import { OrayzenClient } from '../orayzen/orayzen.client.js';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly memory: MemoryService,
    private readonly orayzen: OrayzenClient,
  ) {}

  async seedCompanyKnowledge(): Promise<void> {
    this.logger.log('Starting Day 1 knowledge ingestion...');

    const [goals, kpis, initiatives] = await Promise.all([
      this.orayzen.getGoals(),
      this.orayzen.getKpis(),
      this.orayzen.getInitiatives(),
    ]);

    const stores: Promise<void>[] = [];

    for (const goal of goals) {
      stores.push(
        this.memory.store({
          agent: 'all',
          type: 'semantic',
          content: `Company Goal: ${goal.title}. Status: ${goal.status}. Progress: ${goal.progress}%.`,
          domain: 'strategy',
        }),
      );
    }

    for (const kpi of kpis) {
      stores.push(
        this.memory.store({
          agent: 'all',
          type: 'semantic',
          content: `KPI: ${kpi.name}. Current: ${kpi.value} ${kpi.unit}. Target: ${kpi.target} ${kpi.unit}. Status: ${kpi.status}.`,
          domain: 'performance',
        }),
      );
    }

    for (const initiative of initiatives) {
      stores.push(
        this.memory.store({
          agent: 'all',
          type: 'semantic',
          content: `Initiative: ${initiative.title}. Status: ${initiative.status}. Owner: ${initiative.owner}. Due: ${initiative.dueDate}.`,
          domain: 'strategy',
        }),
      );
    }

    await Promise.allSettled(stores);
    this.logger.log(`Ingestion complete: ${stores.length} records embedded.`);
  }
}
