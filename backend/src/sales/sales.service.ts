import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { Product } from '../entities/product.entity';
import { Client } from '../entities/client.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private salesRepository: Repository<Sale>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(Client)
        private clientsRepository: Repository<Client>,
        private dataSource: DataSource,
    ) { }

    async create(createSaleDto: CreateSaleDto, userId: number): Promise<Sale> {
        return await this.dataSource.transaction(async manager => {
            // Verificar que el cliente existe
            const client = await manager.findOne(Client, {
                where: { id: createSaleDto.clientId }
            });
            if (!client) {
                throw new NotFoundException('Cliente no encontrado');
            }

            // Generar código de venta
            const saleCode = this.generateSaleCode();

            // Crear la venta primero para obtener el ID
            const sale = manager.create(Sale, {
                saleCode,
                date: new Date(),
                clientId: createSaleDto.clientId,
                userId,
                subtotal: 0,
                iva: 0,
                total: 0,
            });

            // Guardar la venta para obtener el ID
            const savedSale = await manager.save(Sale, sale);

            let subtotal = 0;
            let totalIva = 0;
            const saleItems: SaleItem[] = [];

            // Procesar items de la venta
            for (const itemDto of createSaleDto.items) {
                const product = await manager.findOne(Product, {
                    where: { id: itemDto.productId, isActive: true }
                });
                if (!product) {
                    throw new NotFoundException(`Producto con ID ${itemDto.productId} no encontrado`);
                }

                const itemTotal = product.unitPrice * itemDto.quantity;
                const itemIva = itemTotal * (product.iva / 100);

                subtotal += itemTotal;
                totalIva += itemIva;

                const saleItem = manager.create(SaleItem, {
                    saleId: savedSale.id,
                    productId: product.id,
                    productName: product.name,
                    iva: product.iva,
                    unit: product.unit,
                    unitPrice: product.unitPrice,
                    quantity: itemDto.quantity,
                    totalPrice: itemTotal + itemIva,
                });

                saleItems.push(saleItem);
            }

            // Guardar todos los items
            await manager.save(SaleItem, saleItems);

            // Actualizar la venta con los totales calculados
            savedSale.subtotal = subtotal;
            savedSale.iva = totalIva;
            savedSale.total = subtotal + totalIva;

            // Guardar la venta actualizada
            const finalSale = await manager.save(Sale, savedSale);

            // Cargar relaciones para retornar
            const saleWithRelations = await manager.findOne(Sale, {
                where: { id: finalSale.id },
                relations: ['client', 'user', 'items']
            });

            if (!saleWithRelations) {
                throw new NotFoundException('Error al cargar la venta con relaciones');
            }

            return saleWithRelations;
        });
    }

    async findAll(): Promise<Sale[]> {
        return await this.salesRepository.find({
            relations: ['client', 'user', 'items'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number): Promise<Sale> {
        const sale = await this.salesRepository.findOne({
            where: { id },
            relations: ['client', 'user', 'items']
        });
        if (!sale) {
            throw new NotFoundException('Venta no encontrada');
        }
        return sale;
    }

    async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale> {
        throw new Error('La actualización de ventas no está implementada. Cree una nueva venta.');
    }

    async remove(id: number): Promise<void> {
        const sale = await this.findOne(id);
        await this.salesRepository.remove(sale);
    }

    private generateSaleCode(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.toLocaleString('es', { month: 'short' }).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `NTV-${year}-${month}-${random}`;
    }
}