import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SourceGeneratorModule } from './source-generator/source-generator.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    CommonModule,
    SchedulerModule,
    SourceGeneratorModule,
    AiModule,
    AuthModule,
    UserModule,
    RecommendationModule,
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter, // Use ExpressAdapter for the root
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
