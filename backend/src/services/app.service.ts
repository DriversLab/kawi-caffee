import { Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import Redis from 'ioredis';

interface IAppService {
  createOTC(key: string, ttlSeconds: number): Promise<string>;
  verifyOTC(key: string, code: string): Promise<boolean>;
}

@Injectable()
export class AppService implements IAppService {
  private logger: Logger;
  private redis: Redis;

  constructor() {
    this.logger = new Logger(AppService.name);
    this.redis = new Redis({ host: 'localhost', port: 6379 }); // configure as needed
  }

  async createOTC(key: string, ttlSeconds = 120) {
    const code = randomInt(100000, 999999).toString(); // 6-digit code
    await this.redis.set(`otc:${key}`, code, 'EX', ttlSeconds);
    return code;
  }

  async verifyOTC(key: string, code: string) {
    const stored = await this.redis.get(`otc:${key}`);
    this.logger.log(key);
    this.logger.log(stored);
    this.logger.log(code);
    if (!stored) return false;
    if (stored !== code) return false;

    await this.redis.del(`otc:${key}`);
    return true;
  }
}
