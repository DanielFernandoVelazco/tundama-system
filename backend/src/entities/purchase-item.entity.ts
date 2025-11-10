import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Purchase } from './purchase.entity';
import { Product } from './product.entity';

@Entity('purchase_items')
export class PurchaseItem extends BaseEntity {
    @ManyToOne(() => Purchase, purchase => purchase.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'purchaseId' })
    purchase: Purchase;

    @Column()
    purchaseId: number;

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