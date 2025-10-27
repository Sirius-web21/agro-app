import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private client: Redis;

    constructor(private configService: ConfigService) {
        // Инициализация ioredis клиента
        this.client = new Redis({
            host: this.configService.get<string>('REDIS_HOST') || 'localhost',
            port: Number(this.configService.get<string>('REDIS_PORT')) || 6379,
        });
    }

    async set(key: string, value: string, ttlSeconds?: number) {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    async get(key: string) {
        return this.client.get(key);
    }

    async del(key: string) {
        return this.client.del(key);
    }

    async exist(key: string) {
        return (await this.client.exists(key)) === 1;
    }
}
