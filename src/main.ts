import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { IngestionService } from './memory/ingestion.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 3002;

  if (process.argv.includes('--seed')) {
    const ingestion = app.get(IngestionService);
    await ingestion.seedCompanyKnowledge();
    await app.close();
    return;
  }

  await app.listen(port);
  console.log(`Orayzen Intelligence running on port ${port}`);
}
bootstrap();
