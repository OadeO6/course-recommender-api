import { Injectable } from '@nestjs/common';

@Injectable()
export class ChainManagerService {
  startChain(): string {
    return 'Chain started.';
  }
} 