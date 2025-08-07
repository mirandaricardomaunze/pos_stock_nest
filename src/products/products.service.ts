import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Product } from '@prisma/client';
import { MovementService } from '../movements/movements.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly movementService: MovementService,
  ) {}

  async createProduct(
    data: CreateProductDto,
    userId: number,
    companyId: number,
  ): Promise<Product> {
    try {
      // Verifica produto duplicado para essa empresa
      const existing = await this.prisma.product.findFirst({
        where: {
          barcode: data.barcode,
          companyId,
        },
      });

      if (existing) {
        throw new BadRequestException('Produto já cadastrado com este código de barras.');
      }

      // Remova categoryId e supplierId do objeto enviado ao Prisma
      const { id, userId: _userId, categoryName, categoryId, supplierId, ...productData } = data;

      const product = await this.prisma.product.create({
        data: {
          ...productData,
          quantity: productData.quantity ?? 0,
          purchasePrice: productData.purchasePrice ?? 0,
          sellingPrice: productData.sellingPrice ?? 0,
          profit: productData.profit ?? 0,
          company: { connect: { id: companyId } },
          category: categoryId ? { connect: { id: Number(categoryId) } } : undefined,
          supplier: supplierId ? { connect: { id: Number(supplierId) } } : undefined
        },
      });

      await this.createMovement({ ...product, userId });

      return product;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw new InternalServerErrorException('Erro ao criar produto');
    }
  }

  async createMovement(data: any) {
    try {
      await this.movementService.createMovement({
        type: 'CREATE_PRODUCT',
        entityType: 'Product',
        entityId: data.id,
        description: 'Novo produto cadastrado',
        user: {connect: { id: data.userId }},
        details: {
          nome: data.name || '',
          quantidade: data.quantity || 0,
          preco: data.purchasePrice || 0,
        },
      });
    } catch (error) {
      console.warn('Erro ao registrar movimento:', error);
    }
  }

  async getProducts(): Promise<Product[]> {
    return this.prisma.product.findMany({
      include: {
        category: true,
        supplier: true,
        company: true,
      },
    });
  }

  async getProductsByCompany(companyId: number): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: { companyId },
        include: {
          category: true,
          supplier: true,
        },
      });

      if (products.length === 0) {
        throw new NotFoundException('Nenhum produto encontrado para esta empresa');
      }

      return products;
    } catch (error) {
      console.error('Erro ao buscar produtos por empresa:', error);
      throw new InternalServerErrorException('Erro ao buscar produtos');
    }
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true },
    });
  }

  async getTotalProductsByCompany(companyId: number): Promise<number> {
    return this.prisma.product.count({
      where: { companyId },
    });
  }

  async getTotalQuantityProductsByCompany(companyId: number): Promise<number> {
    const result = await this.prisma.product.aggregate({
      where: { companyId },
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  }
  
}
