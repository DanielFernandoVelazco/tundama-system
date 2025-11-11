import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    @UsePipes(new ValidationPipe())
    create(@Body() createSaleDto: CreateSaleDto, @Req() req) {
        const userId = req.user.id; // Obtener el ID del usuario autenticado
        return this.salesService.create(createSaleDto, userId);
    }

    @Get()
    findAll() {
        return this.salesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesService.findOne(+id);
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe())
    update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
        return this.salesService.update(+id, updateSaleDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.salesService.remove(+id);
    }
}