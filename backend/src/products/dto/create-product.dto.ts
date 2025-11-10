import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    iva: number;

    @IsNotEmpty()
    @IsString()
    unit: string;

    @IsOptional()
    @IsString()
    description?: string;
}