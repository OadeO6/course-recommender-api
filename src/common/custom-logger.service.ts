import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CustomLoggerService extends Logger {
  // ANSI color codes
  private readonly colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
  };

  info(message: any, context?: string) {
    const coloredMessage = `${this.colors.green}[INFO]${this.colors.reset} ${message}`;
    super.log(coloredMessage, context);
  }

  error(message: any, trace?: string, context?: string) {
    const coloredMessage = `${this.colors.red}[ERROR]${this.colors.reset} ${message}`;
    super.error(coloredMessage, trace, context);
  }

  warn(message: any, context?: string) {
    const coloredMessage = `${this.colors.yellow}[WARN]${this.colors.reset} ${message}`;
    super.warn(coloredMessage, context);
  }

  debug(message: any, context?: string) {
    const coloredMessage = `${this.colors.cyan}[DEBUG]${this.colors.reset} ${message}`;
    super.debug(coloredMessage, context);
  }
} 