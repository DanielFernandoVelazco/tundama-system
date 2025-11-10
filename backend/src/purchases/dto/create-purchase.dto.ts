import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseItemDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsNotEmpty()
    @IsNumber()
    unitPrice: number;

    @IsNotEmpty()
    @IsNumber()
    iva: number; // IVA específico para esta compra
}

export class CreatePurchaseDto {
    @IsNotEmpty()
    @IsNumber()
    providerId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PurchaseItemDto)
    items: PurchaseItemDto[];
}