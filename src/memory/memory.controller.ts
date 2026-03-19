import { Controller, Get, Post, Delete, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MemoryService } from './memory.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import type { MemoryRecord } from './memory.types.js';

@Controller('api/memories')
@UseGuards(AuthGuard)
export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  @Get()
  async list(@Query('domain') domain?: string) {
    return this.memoryService.list(domain);
  }

  @Post()
  async store(@Body() body: MemoryRecord) {
    await this.memoryService.store(body);
    return { success: true };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { content: string }) {
    await this.memoryService.update(id, body.content);
    return { success: true };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.memoryService.delete(id);
    return { success: true };
  }

  @Post('search')
  async search(@Body() body: { query: string; agent?: string; topK?: number }) {
    const agent = body.agent ?? 'all';
    const topK = body.topK ?? 5;
    return this.memoryService.retrieve(body.query, agent, topK);
  }

  @Get('stats')
  async stats() {
    return this.memoryService.stats();
  }
}
