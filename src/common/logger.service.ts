import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLoggerService {
  private readonly logger = new Logger(AppLoggerService.name);

  // ANSI color codes
  private readonly colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
  };

  info(message: string, context?: string) {
    const coloredMessage = `${this.colors.green}[INFO]${this.colors.reset} ${message}`;
    this.logger.log(coloredMessage, context);
  }

  error(message: string, trace?: string, context?: string) {
    const coloredMessage = `${this.colors.red}[ERROR]${this.colors.reset} ${message}`;
    this.logger.error(coloredMessage, trace, context);
  }

  warn(message: string, context?: string) {
    const coloredMessage = `${this.colors.yellow}[WARN]${this.colors.reset} ${message}`;
    this.logger.warn(coloredMessage, context);
  }

  debug(message: string, context?: string) {
    const coloredMessage = `${this.colors.cyan}[DEBUG]${this.colors.reset} ${message}`;
    this.logger.debug(coloredMessage, context);
  }
} 