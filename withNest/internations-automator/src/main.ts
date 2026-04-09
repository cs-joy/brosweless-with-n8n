import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InternationsService } from './internations/internations.service';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const internationsService = app.get(InternationsService);

  // Example: Run once on startup (remove if you only want cron)
  // await internationsService.runAutomation({
  //   subject: 'Automated post from NestJS + Browserless',
  //   body: 'This was posted automatically at ' + new Date().toISOString(),
  // });

  await app.listen(3000);
  console.log('🚀 Internations Automator is running (NestJS + Browserless)');
}

bootstrap();