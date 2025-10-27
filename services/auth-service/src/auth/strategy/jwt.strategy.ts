import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { TOKEN_REVORKED_ERROR, USER_NOT_FOUND_ERROR } from '../auth.constants';
import { RedisService } from 'src/redis/redis.service';

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    jti?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly prismaService: PrismaService,
        private readonly redisService: RedisService,
    ) {
        const secret = configService.get<string>('JWT_SECRET', { infer: true });
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload) {
        const exists = await this.redisService.exist(`access:${payload.jti}`);
        if (!exists) throw new UnauthorizedException(TOKEN_REVORKED_ERROR);

        const user = this.prismaService.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user) throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
        return {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
}
