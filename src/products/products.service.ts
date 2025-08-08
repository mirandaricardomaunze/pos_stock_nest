import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Product } from '@prisma/client';
import { MovementService } from '../movements/movements.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

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
      const ivaPercent = data.iva ?? 0;
      const purchasePriceWithIva =
        (data.purchasePrice ?? 0) + ((data.purchasePrice ?? 0) * ivaPercent) / 100;

      // Calcula lucro
      const sellingPrice = data.sellingPrice ?? purchasePriceWithIva;
      const profit = sellingPrice - purchasePriceWithIva;

      const existing = await this.prisma.product.findFirst({
        where: { barcode: data.barcode, companyId },
      });

      if (existing) {
        const updated = await this.prisma.product.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + (data.quantity ?? 0),
            purchasePrice: purchasePriceWithIva,
            sellingPrice,
            profit,
          },
        });

        await this.createMovement({
          ...updated,
          userId,
          movementType: 'UPDATE_QUANTITY',
        });

        return updated;
      }

      // Remove campos não usados diretamente no Prisma
      const {
        id,
        userId: _userId,
        categoryName,
        categoryId,
        supplierId,
        ...productData
      } = data;

      const product = await this.prisma.product.create({
        data: {
          ...productData,
          quantity: productData.quantity ?? 0,
          purchasePrice: purchasePriceWithIva,
          sellingPrice,
          profit,
          company: { connect: { id: companyId } },
          category: categoryId ? { connect: { id: Number(categoryId) } } : undefined,
          supplier: supplierId ? { connect: { id: Number(supplierId) } } : undefined,
        },
      });

      await this.createMovement({
        ...product,
        userId,
        movementType: 'CREATE_PRODUCT',
      });

      return product;
    } catch (error) {
      this.logger.error(
        `Erro ao criar/atualizar produto para empresa ${companyId}: ${error.message}`,
        error.stack,
      );

      if (error.code === 'P2003') {
        throw new BadRequestException('Categoria ou fornecedor informado não existe.');
      }

      throw new InternalServerErrorException('Ocorreu um erro ao criar ou atualizar o produto.');
    }
  }

  private async createMovement(data: any) {
    try {
      let description = '';
      let type = '';

      if (data.movementType === 'UPDATE_QUANTITY') {
        type = 'UPDATE_PRODUCT';
        description = 'Quantidade de produto atualizada';
      } else if (data.movementType === 'CREATE_PRODUCT') {
        type = 'CREATE_PRODUCT';
        description = 'Novo produto cadastrado';
      } else if (data.movementType === 'UPDATE_PRODUCT') {
        type = 'UPDATE_PRODUCT';
        description = 'Produto atualizado';
      } else if (data.movementType === 'DELETE_PRODUCT') {
        type = 'DELETE_PRODUCT';
        description = 'Produto excluído';
      }

      await this.movementService.createMovement({
        type,
        entityType: 'Product',
        entityId: data.id,
        description,
        user: { connect: { id: data.userId } },
        details: {
          nome: data.name || '',
          quantidade: data.quantity || 0,
          preco: data.purchasePrice || 0,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Falha ao registrar movimento para produto ID ${data.id}: ${error.message}`,
      );
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      return await this.prisma.product.findMany({
        include: { category: true, supplier: true, company: true },
      });
    } catch (error) {
      this.logger.error('Erro ao buscar todos os produtos', error.stack);
      throw new InternalServerErrorException('Erro ao buscar a lista de produtos.');
    }
  }

  async getProductsByCompany(companyId: number): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: { companyId },
        include: { category: true, supplier: true },
      });

      return products;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar produtos para empresa ${companyId}`,
        error.stack,
      );

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('Erro ao buscar produtos da empresa.');
    }
  }

  async getProductById(id: number): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: { category: true, supplier: true },
      });

      if (!product) {
        throw new NotFoundException('Produto não encontrado.');
      }

      return product;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar produto ID ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) throw error;

      throw new InternalServerErrorException('Erro ao buscar informações do produto.');
    }
  }

  async getTotalProductsByCompany(companyId: number): Promise<number> {
    try {
      return await this.prisma.product.count({ where: { companyId } });
    } catch (error) {
      this.logger.error(
        `Erro ao contar produtos da empresa ${companyId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao obter o total de produtos.');
    }
  }

  async getTotalQuantityProductsByCompany(companyId: number): Promise<number> {
    try {
      const result = await this.prisma.product.aggregate({
        where: { companyId },
        _sum: { quantity: true },
      });
      return result._sum.quantity || 0;
    } catch (error) {
      this.logger.error(
        `Erro ao calcular quantidade total de produtos para empresa ${companyId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao calcular quantidade total de produtos.');
    }
  }

  async updateProduct(
    id: number,
    data: Partial<CreateProductDto>,
    userId: number,
  ): Promise<Product> {
    try {
      const existing = await this.prisma.product.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Produto não encontrado');
      }

      const ivaPercent = data.iva ?? existing.iva ?? 0;
      const purchasePrice = data.purchasePrice ?? existing.purchasePrice;
      const purchasePriceWithIva = purchasePrice + (purchasePrice * ivaPercent) / 100;
      const sellingPrice = data.sellingPrice ?? existing.sellingPrice;
      const profit = sellingPrice - purchasePriceWithIva;

      const updated = await this.prisma.product.update({
        where: { id },
        data: {
          ...data,
          purchasePrice: purchasePriceWithIva,
          sellingPrice,
          profit,
          companyId: existing.companyId, // mantém empresa fixa
        },
      });

      await this.createMovement({
        ...updated,
        userId,
        movementType: 'UPDATE_PRODUCT',
      });

      return updated;
    } catch (error) {
      this.logger.error(`Erro ao atualizar produto ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro ao atualizar produto');
    }
  }

  async deleteProduct(id: number, userId: number): Promise<void> {
    try {
      const existing = await this.prisma.product.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Produto não encontrado');
      }

      await this.prisma.product.delete({ where: { id } });

      await this.createMovement({
        id,
        userId,
        movementType: 'DELETE_PRODUCT',
        name: existing.name,
        quantity: existing.quantity,
        purchasePrice: existing.purchasePrice,
      });
    } catch (error) {
      this.logger.error(`Erro ao excluir produto ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro ao excluir produto');
    }
  }
}
