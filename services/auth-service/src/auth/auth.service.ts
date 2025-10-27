import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
    INVALID_TOKEN_ERROR,
    USER_NOT_FOUND_ERROR,
    WRONG_PASSWORD_ERROR,
} from './auth.constants';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { RedisService } from 'src/redis/redis.service';
@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private configService: ConfigService,
        private readonly jwtService: JwtService,
        private redisService: RedisService,
    ) {}

    //сервис для создания нового пользователя
    async createUser(email: string, password: string) {
        const hash = await bcrypt.hash(password, 12);
        return this.prismaService.user.create({
            data: { email, password: hash },
        });
    }

    //поиск пользователя по почте
    async findUser(email: string) {
        return this.prismaService.user.findUnique({
            where: { email },
        });
    }

    //сервис для валидации пользователя, проверяет существование пользователя в БД также правильный ли его данные
    async validateUser(email: string, password: string) {
        const user = await this.findUser(email);
        if (!user) {
            throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
        }

        const isCorrectPassword = await compare(password, user.password);

        if (!isCorrectPassword) {
            throw new UnauthorizedException(WRONG_PASSWORD_ERROR);
        }

        return { email: user.email };
    }

    //сервис login принимает id, email, role для формирования JWT
    async login(user: { id: string; email: string; role: string }) {
        const jti = randomUUID();
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            jti,
        };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: `${this.configService.get<string>('EXPIRES_IN_ACCESS')}m`,
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: `${this.configService.get<string>('EXPIRES_IN_REFRESH')}d`,
        });

        //Сохраняем jti в Redis с TTL = срок действия access token
        await this.redisService.set(`access:${jti}`, user.id, 15 * 60);
        // Сохраняем refresh токен в Redis с TTL = 7 дней
        await this.redisService.set(
            `refresh:${user.id}`,
            refreshToken,
            60 * 60 * 24 * 7,
        );

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    //сервис по выдачи новых токенов
    async refreshTokens(userId: string, refreshToken: string) {
        const storedToken = await this.redisService.get(`refresh:${userId}`);
        if (!storedToken || storedToken !== refreshToken) {
            throw new UnauthorizedException(INVALID_TOKEN_ERROR);
        }

        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
        });
        if (!user) throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
        return this.login(user);
    }

    async logout(userId: string, jti: string) {
        await this.redisService.del(`access:${jti}`);
        await this.redisService.del(`refresh:${userId}`);
    }
}
