import { Controller, Post, Body, UsePipes, ValidationPipe, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) { }

    @Post('login')
    @UsePipes(new ValidationPipe())
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('signup')
    @UsePipes(new ValidationPipe())
    async signup(@Body() createUserDto: CreateUserDto) {
        try {
            const user = await this.usersService.create(createUserDto);

            // Ocultar la contraseña en la respuesta
            const { password, ...userWithoutPassword } = user;

            return {
                message: 'Usuario registrado exitosamente',
                user: userWithoutPassword
            };
        } catch (error) {
            if (error.code === '23505') { // Código de error de PostgreSQL para duplicados
                throw new ConflictException('El email ya está registrado');
            }
            throw error;
        }
    }
}