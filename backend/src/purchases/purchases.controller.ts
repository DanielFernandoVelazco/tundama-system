import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
    constructor(private readonly purchasesService: PurchasesService) { }

    @Post()
    @UsePipes(new ValidationPipe())
    create(@Body() createPurchaseDto: CreatePurchaseDto, @Req() req) {
        const userId = req.user.id; // Obtener el ID del usuario autenticado
        return this.purchasesService.create(createPurchaseDto, userId);
    }

    @Get()
    findAll() {
        return this.purchasesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.purchasesService.findOne(+id);
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe())
    update(@Param('id') id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
        return this.purchasesService.update(+id, updatePurchaseDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.purchasesService.remove(+id);
    }
}