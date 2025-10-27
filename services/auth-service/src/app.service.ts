import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class AppService {
    private redis: Redis;

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) {}
}
