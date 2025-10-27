import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('register')
    register(@Body() dto: AuthDto) {
        // return this.authService.createUser(dto);
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() { login, password }: AuthDto) {
        const { email } = await this.authService.validateUser(login, password);
        //return this.authService.login(email);
    }
}
