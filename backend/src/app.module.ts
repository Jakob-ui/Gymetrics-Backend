import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { ConfigModule } from '@nestjs/config';
import { TrainingtemplatesModule } from './trainingtemplates/trainingtemplates.module';
import { TrainingModule } from './training/training.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperModule } from './scraper/scraper.module';
import { StudiosModule } from './studios/studios.module';
import { AgentToolsModule } from './agent-tools/agent-tools.module';
import { OllamaModule } from './ollama/ollama.module';

const scraperEnabled = process.env.ENABLE_SCRAPER === 'true';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        `mongodb://user:root@localhost:27017/gymetrics?authSource=admin`,
    ),
    UserModule,
    AuthModule,
    TrainingtemplatesModule,
    TrainingModule,
    ...scraperEnabled ? [ScraperModule] : [],
    StudiosModule,
    StudiosModule,
    AgentToolsModule,
    OllamaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
