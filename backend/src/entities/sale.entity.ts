import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { SaleItem } from './sale-item.entity';
import { Client } from './client.entity';
import { User } from './user.entity';

@Entity('sales')
export class Sale extends BaseEntity {
    @Column({ unique: true })
    saleCode: string; // NTV-2023-ABR-0074

    @Column()
    date: Date;

    @ManyToOne(() => Client)
    @JoinColumn({ name: 'clientId' })
    client: Client;

    @Column()
    clientId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number;

    @Column('decimal', { precision: 10, scale: 2 })
    iva: number;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @OneToMany(() => SaleItem, saleItem => saleItem.sale, { cascade: true })
    items: SaleItem[];
}