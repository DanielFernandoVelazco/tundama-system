import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('providers')
export class Provider extends BaseEntity {
    @Column({ unique: true })
    providerCode: string; // NTP-2023-ABR-0052

    @Column()
    companyName: string;

    @Column()
    identification: string;

    @Column({ default: 'NIT' })
    identificationType: string;

    @Column()
    address: string;

    @Column()
    phone: string;

    @Column('text', { nullable: true })
    notes: string;
}