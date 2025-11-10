import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const productCode = this.generateProductCode();

        const product = this.productsRepository.create({
            ...createProductDto,
            productCode,
        });

        return await this.productsRepository.save(product);
    }

    async findAll(): Promise<Product[]> {
        return await this.productsRepository.find({ where: { isActive: true } });
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productsRepository.findOne({
            where: { id, isActive: true }
        });
        if (!product) {
            throw new NotFoundException('Producto no encontrado');
        }
        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        await this.productsRepository.update(id, updateProductDto);
        return await this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.productsRepository.update(id, { isActive: false });
    }

    private generateProductCode(): string {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `PRD${random}`;
    }
}