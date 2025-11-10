import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { Product } from '../entities/product.entity';
import { Client } from '../entities/client.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

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

            const sale = manager.create(Sale, {
                saleCode,
                clientId: createSaleDto.clientId,
                userId,
                date: new Date(),
                subtotal: 0,
                iva: 0,
                total: 0,
            });

            let subtotal = 0;
            let totalIva = 0;

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
                    sale,
                    productId: product.id,
                    productName: product.name,
                    iva: product.iva,
                    unit: product.unit,
                    unitPrice: product.unitPrice,
                    quantity: itemDto.quantity,
                    totalPrice: itemTotal + itemIva,
                });

                sale.items = sale.items || [];
                sale.items.push(saleItem);
            }

            // Calcular totales
            sale.subtotal = subtotal;
            sale.iva = totalIva;
            sale.total = subtotal + totalIva;

            return await manager.save(sale);
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

    private generateSaleCode(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.toLocaleString('es', { month: 'short' }).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `NTV-${year}-${month}-${random}`;
    }
}