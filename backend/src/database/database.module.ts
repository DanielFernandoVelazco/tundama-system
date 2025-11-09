import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true', // Solo para desarrollo
                logging: configService.get<string>('DB_LOGGING') === 'true',
            }),
        }),
        TypeOrmModule.forFeature([User]), // Repositorio de User
    ],
})
export class DatabaseModule { }