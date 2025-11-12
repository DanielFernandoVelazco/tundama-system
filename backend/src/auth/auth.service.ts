import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(loginDto: LoginDto): Promise<any> {
        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);
        if (user && await user.validatePassword(password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                userCode: user.userCode,
                name: user.name,
                email: user.email,
                identification: user.identification,
                identificationType: user.identificationType,
                notes: user.notes,
            },
        };
    }

    async validateUserById(userId: number) {
        return await this.usersService.findOne(userId);
    }
}