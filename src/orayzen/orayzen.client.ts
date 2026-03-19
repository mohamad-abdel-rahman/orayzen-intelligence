import { Injectable } from '@nestjs/common';
import type { OrayzenGoal, OrayzenKpi, OrayzenInitiative } from './orayzen.types.js';

@Injectable()
export class OrayzenClient {
  async getGoals(): Promise<OrayzenGoal[]> {
    // TODO: Implement in Plan 1 Chunk 2
    return [];
  }

  async getKpis(): Promise<OrayzenKpi[]> {
    // TODO: Implement in Plan 1 Chunk 2
    return [];
  }

  async getInitiatives(): Promise<OrayzenInitiative[]> {
    // TODO: Implement in Plan 1 Chunk 2
    return [];
  }
}
