import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    identification: string;

    @IsEnum(['NIT', 'CEDULA'])
    identificationType: 'NIT' | 'CEDULA';

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    notes?: string;
}