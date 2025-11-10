import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Purchase } from '../entities/purchase.entity';
import { PurchaseItem } from '../entities/purchase-item.entity';
import { Product } from '../entities/product.entity';
import { Provider } from '../entities/provider.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Injectable()
export class PurchasesService {
    constructor(
        @InjectRepository(Purchase)
        private purchasesRepository: Repository<Purchase>,
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        @InjectRepository(Provider)
        private providersRepository: Repository<Provider>,
        private dataSource: DataSource,
    ) { }

    async create(createPurchaseDto: CreatePurchaseDto, userId: number): Promise<Purchase> {
        return await this.dataSource.transaction(async manager => {
            // Verificar que el proveedor existe
            const provider = await manager.findOne(Provider, {
                where: { id: createPurchaseDto.providerId }
            });
            if (!provider) {
                throw new NotFoundException('Proveedor no encontrado');
            }

            // Generar código de compra
            const purchaseCode = this.generatePurchaseCode();

            const purchase = manager.create(Purchase, {
                purchaseCode,
                providerId: createPurchaseDto.providerId,
                userId,
                subtotal: 0,
                iva: 0,
                total: 0,
            });

            let subtotal = 0;
            let totalIva = 0;

            // Procesar items de la compra
            for (const itemDto of createPurchaseDto.items) {
                const product = await manager.findOne(Product, {
                    where: { id: itemDto.productId, isActive: true }
                });
                if (!product) {
                    throw new NotFoundException(`Producto con ID ${itemDto.productId} no encontrado`);
                }

                const itemTotal = itemDto.unitPrice * itemDto.quantity;
                const itemIva = itemTotal * (itemDto.iva / 100);

                subtotal += itemTotal;
                totalIva += itemIva;

                const purchaseItem = manager.create(PurchaseItem, {
                    purchase,
                    productId: product.id,
                    productName: product.name,
                    iva: itemDto.iva,
                    unit: product.unit,
                    unitPrice: itemDto.unitPrice,
                    quantity: itemDto.quantity,
                    totalPrice: itemTotal + itemIva,
                });

                purchase.items = purchase.items || [];
                purchase.items.push(purchaseItem);
            }

            // Calcular totales
            purchase.subtotal = subtotal;
            purchase.iva = totalIva;
            purchase.total = subtotal + totalIva;

            return await manager.save(purchase);
        });
    }

    async findAll(): Promise<Purchase[]> {
        return await this.purchasesRepository.find({
            relations: ['provider', 'user', 'items'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number): Promise<Purchase> {
        const purchase = await this.purchasesRepository.findOne({
            where: { id },
            relations: ['provider', 'user', 'items']
        });
        if (!purchase) {
            throw new NotFoundException('Compra no encontrada');
        }
        return purchase;
    }

    async update(id: number, updatePurchaseDto: UpdatePurchaseDto): Promise<Purchase> {
        // Implementar lógica de actualización si es necesario
        throw new Error('Method not implemented');
    }

    async remove(id: number): Promise<void> {
        const purchase = await this.findOne(id);
        await this.purchasesRepository.remove(purchase);
    }

    private generatePurchaseCode(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.toLocaleString('es', { month: 'short' }).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `NTCO-${year}-${month}-${random}`;
    }
}