import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service.js';
import { MemoryController } from './memory.controller.js';
import { IngestionService } from './ingestion.service.js';
import { OrayzenClient } from '../orayzen/orayzen.client.js';

@Module({
  controllers: [MemoryController],
  providers: [MemoryService, IngestionService, OrayzenClient],
  exports: [MemoryService, IngestionService],
})
export class MemoryModule {}
