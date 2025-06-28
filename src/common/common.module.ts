import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './logger.service';
import { CustomLoggerService } from './custom-logger.service';

@Global()
@Module({
  providers: [AppLoggerService, CustomLoggerService],
  exports: [AppLoggerService, CustomLoggerService],
})
export class CommonModule {} 