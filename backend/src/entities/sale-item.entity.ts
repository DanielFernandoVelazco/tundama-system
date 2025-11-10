import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Sale } from './sale.entity';
import { Product } from './product.entity';

@Entity('sale_items')
export class SaleItem extends BaseEntity {
    @ManyToOne(() => Sale, sale => sale.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'saleId' })
    sale: Sale;

    @Column()
    saleId: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column()
    productId: number;

    @Column()
    productName: string;

    @Column('decimal', { precision: 5, scale: 2 })
    iva: number;

    @Column()
    unit: string;

    @Column('decimal', { precision: 10, scale: 2 })
    unitPrice: number;

    @Column('int')
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    totalPrice: number;
}