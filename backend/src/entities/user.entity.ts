import { Entity, Column, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.entity';
import * as bcrypt from 'bcryptjs';

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    userCode: string; // NTU-2023-ABR-0074

    @Column()
    name: string;

    @Column()
    identification: string;

    @Column({ type: 'varchar' })
    identificationType: 'NIT' | 'CEDULA';

    @Column()
    phone: string;

    @Column()
    address: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column('text', { nullable: true })
    notes: string;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}