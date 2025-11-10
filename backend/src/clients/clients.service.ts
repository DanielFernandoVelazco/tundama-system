import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientsRepository: Repository<Client>,
    ) { }

    async create(createClientDto: CreateClientDto): Promise<Client> {
        // Verificar si la identificación ya existe
        const existingClient = await this.clientsRepository.findOne({
            where: { identification: createClientDto.identification },
        });

        if (existingClient) {
            throw new ConflictException('La identificación ya está registrada');
        }

        const clientCode = this.generateClientCode();

        const client = this.clientsRepository.create({
            ...createClientDto,
            clientCode,
        });

        return await this.clientsRepository.save(client);
    }

    async findAll(): Promise<Client[]> {
        return await this.clientsRepository.find();
    }

    async findOne(id: number): Promise<Client> {
        const client = await this.clientsRepository.findOne({ where: { id } });
        if (!client) {
            throw new NotFoundException('Cliente no encontrado');
        }
        return client;
    }

    async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
        const client = await this.findOne(id);

        // Si se actualiza la identificación, verificar que no exista
        if (updateClientDto.identification && updateClientDto.identification !== client.identification) {
            const existingClient = await this.clientsRepository.findOne({
                where: { identification: updateClientDto.identification },
            });
            if (existingClient) {
                throw new ConflictException('La identificación ya está registrada');
            }
        }

        await this.clientsRepository.update(id, updateClientDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        const client = await this.findOne(id);
        await this.clientsRepository.remove(client);
    }

    private generateClientCode(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.toLocaleString('es', { month: 'short' }).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `NTC-${year}-${month}-${random}`;
    }
}