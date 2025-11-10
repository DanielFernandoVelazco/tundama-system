import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('products')
export class Product extends BaseEntity {
    @Column({ unique: true })
    productCode: string; // PRD001

    @Column()
    name: string;

    @Column('decimal', { precision: 10, scale: 2 })
    unitPrice: number;

    @Column('decimal', { precision: 5, scale: 2 })
    iva: number; // 19%, 5%, 0%

    @Column()
    unit: string; // Kg, Und, Lt, etc.

    @Column('text', { nullable: true })
    description: string;

    @Column({ default: true })
    isActive: boolean;
}