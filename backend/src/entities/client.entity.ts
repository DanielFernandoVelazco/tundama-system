import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('clients')
export class Client extends BaseEntity {
    @Column({ unique: true })
    clientCode: string; // NTC-2023-ABR-0052

    @Column()
    name: string;

    @Column()
    identification: string;

    @Column({ type: 'varchar' })
    identificationType: 'NIT' | 'CEDULA';

    @Column()
    address: string;

    @Column()
    phone: string;

    @Column('text', { nullable: true })
    notes: string;
}