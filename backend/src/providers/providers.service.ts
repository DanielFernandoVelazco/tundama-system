import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
    constructor(
        @InjectRepository(Provider)
        private providersRepository: Repository<Provider>,
    ) { }

    async create(createProviderDto: CreateProviderDto): Promise<Provider> {
        const existingProvider = await this.providersRepository.findOne({
            where: { identification: createProviderDto.identification },
        });

        if (existingProvider) {
            throw new ConflictException('La identificación ya está registrada');
        }

        const providerCode = this.generateProviderCode();

        const provider = this.providersRepository.create({
            ...createProviderDto,
            providerCode,
            identificationType: 'NIT', // Siempre NIT para proveedores
        });

        return await this.providersRepository.save(provider);
    }

    async findAll(): Promise<Provider[]> {
        return await this.providersRepository.find();
    }

    async findOne(id: number): Promise<Provider> {
        const provider = await this.providersRepository.findOne({ where: { id } });
        if (!provider) {
            throw new NotFoundException('Proveedor no encontrado');
        }
        return provider;
    }

    async update(id: number, updateProviderDto: UpdateProviderDto): Promise<Provider> {
        const provider = await this.findOne(id);

        if (updateProviderDto.identification && updateProviderDto.identification !== provider.identification) {
            const existingProvider = await this.providersRepository.findOne({
                where: { identification: updateProviderDto.identification },
            });
            if (existingProvider) {
                throw new ConflictException('La identificación ya está registrada');
            }
        }

        await this.providersRepository.update(id, updateProviderDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const provider = await this.findOne(id);
        await this.providersRepository.remove(provider);
    }

    private generateProviderCode(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.toLocaleString('es', { month: 'short' }).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `NTP-${year}-${month}-${random}`;
    }
}