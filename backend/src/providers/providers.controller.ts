import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('providers')
@UseGuards(JwtAuthGuard)
export class ProvidersController {
    constructor(private readonly providersService: ProvidersService) { }

    @Post()
    @UsePipes(new ValidationPipe())
    create(@Body() createProviderDto: CreateProviderDto) {
        return this.providersService.create(createProviderDto);
    }

    @Get()
    findAll() {
        return this.providersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.providersService.findOne(+id);
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe())
    update(@Param('id') id: string, @Body() updateProviderDto: UpdateProviderDto) {
        return this.providersService.update(+id, updateProviderDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.providersService.remove(+id);
    }
}