import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseItem } from './purchase-item.entity';
import { Provider } from './provider.entity';
import { User } from './user.entity';

@Entity('purchases')
export class Purchase extends BaseEntity {
    @Column({ unique: true })
    purchaseCode: string; // NTCO-2023-ABR-0149

    @ManyToOne(() => Provider)
    @JoinColumn({ name: 'providerId' })
    provider: Provider;

    @Column()
    providerId: number;

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

    @OneToMany(() => PurchaseItem, purchaseItem => purchaseItem.purchase, { cascade: true })
    items: PurchaseItem[];
}