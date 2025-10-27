import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'AUTH_SERVICE',
                transport: Transport.REDIS,
                options: {
                    host: process.env.REDIS_HOST,
                    port: 6379,
                    wildcards: true,
                },
            },
        ]),
        RedisModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, PrismaService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
