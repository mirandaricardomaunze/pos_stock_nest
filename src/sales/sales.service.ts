import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create.sale.dto';
import { TopProduct } from 'src/types/topProducts';
import { StockCheckService } from 'src/stock-check/stock-check.service';
import { Request } from 'express';

@Injectable()
export class SaleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockCheckService: StockCheckService,
  ) {}

  async create(createSaleDto: CreateSaleDto, req: Request) {
    if (!req.user) {
      throw new BadRequestException('Usuário não autenticado');
    }
    const userId = req.user['sub'] || req.user['id'];
    const companyId = req.user['companyId'];

    try {
      const { items } = createSaleDto;
      let profit = 0;
      let subTotal = 0;
      let iva = 0;

      const products = await this.prisma.product.findMany({
        where: { id: { in: items.map(i => i.productId) } },
      });

      if (products.length === 0) {
        throw new NotFoundException('Nenhum produto encontrado para os IDs fornecidos');
      }

      const saleItems = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new NotFoundException(`Produto ${item.productId} não encontrado`);
        if (product.quantity < item.quantity)
          throw new BadRequestException(`Estoque insuficiente para o produto ${product.name}`);

        const price = product.sellingPrice || 0;
        const purchasePrice = product.purchasePrice || 0;
        const itemIva = product.iva ?? 0.16;

        profit += (price - purchasePrice) * item.quantity;
        subTotal += price * item.quantity;
        iva += itemIva * price * item.quantity;

        return {
          productId: item.productId,
          quantity: item.quantity,
          price,
          purchasePrice,
        };
      });

      const total = subTotal + iva;

      const sale = await this.prisma.sale.create({
        data: {
          total,
          profit,
          iva,
          subTotal,
          amountPaid: createSaleDto.amountPaid ?? 0,
          change: createSaleDto.change ?? 0,
          items: {
            create: saleItems,
          },
          user: {
            connect: { id: userId },
          },
         company: {
            connect: { id: companyId },
          },
          clientName: createSaleDto.clientName ?? '',
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      const productsUpdated = await this.prisma.product.findMany({
        where: { id: { in: items.map(i => i.productId) } },
      });

      await this.prisma.movement.create({
        data: {
          type: 'SALE',
          entityType: 'Product',
          entityId: productsUpdated[0]?.id ?? 0,
          description: productsUpdated.map(p => p.name).join(', '),
          clientName: createSaleDto.clientName,
          amountPaid: createSaleDto.amountPaid ?? 0,
          change: createSaleDto.change ?? 0,
          user: { connect: { id: userId } },
          details: items.map(item => {
            const product = productsUpdated.find(p => p.id === item.productId);
            return {
              name: product?.name || '',
              quantity: item.quantity,
              price: product?.sellingPrice || 0,
            };
          }),
        },
      });

      for (const item of items) {
        await this.stockCheckService.checkStock(item.productId, userId, companyId);
      }

      return sale;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Erro ao criar venda:', error);
      throw new InternalServerErrorException('Erro interno ao criar venda');
    }
  }

  async findAll(req: Request) {
    if (!req.user) {
      throw new BadRequestException('Usuário não autenticado');
    }
    const companyId = req.user['companyId'];
    try {
      return await this.prisma.sale.findMany({
        where: { companyId },
        include: {
          items: {
            include: { product: true },
          },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw new InternalServerErrorException('Erro ao buscar vendas');
    }
  }

  async getSalesStatsByMonth() {
    try {
      const stats = await this.prisma.$queryRaw<Array<{
        month: string;
        total: number;
        profit: number;
      }>>`
        SELECT 
          TO_CHAR("createdAt", 'MM/YYYY') as month,
          SUM("total") as total,
          SUM("profit") as profit
        FROM "Sale"
        GROUP BY TO_CHAR("createdAt", 'MM/YYYY')
        ORDER BY MIN("createdAt") DESC
        LIMIT 12
      `;

      return stats.map(stat => ({
        ...stat,
        total: Number(stat.total),
        profit: Number(stat.profit),
      }));
    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
      throw new InternalServerErrorException('Erro ao buscar estatísticas mensais');
    }
  }

  async getTopProducts(): Promise<TopProduct[]> {
    try {
      const topProducts = await this.prisma.$queryRaw<TopProduct[]>`
        SELECT 
          p.name,
          COALESCE(SUM(si.quantity), 0) as "quantitySold"
        FROM "Product" p
        LEFT JOIN "SaleItem" si ON p.id = si."productId"
        WHERE si."createdAt" >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY p.name
        ORDER BY "quantitySold" DESC
      `;

      return topProducts.map(product => ({
        name: product.name,
        quantitySold: Number(product.quantitySold),
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error);
      throw new InternalServerErrorException('Erro ao buscar produtos mais vendidos');
    }
  }

  async getAllSales(): Promise<any[]> {
    try {
      const sales = await this.prisma.saleItem.findMany({
        include: {
          product: true,
          sale: true,
        },
      });
      return sales.map(sale => ({
        ...sale,
        createdAt: sale.createdAt.toISOString(),
        updatedAt: sale.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar todas as vendas:', error);
      throw new InternalServerErrorException('Erro ao buscar todas as vendas');
    }
  }

  async getReportByDateRange(startDate?: Date, endDate?: Date): Promise<{ sales: any[]; total: number }> {
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    try {
      const where: any = {};

      if (startDate && endDate) {
        where.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      const sales = await this.prisma.sale.findMany({
        where,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const salesWithDates = sales.map(sale => ({
        ...sale,
        createdAt: sale.createdAt?.toISOString(),
        updatedAt: sale.updatedAt?.toISOString(),
      }));

      const total = sales.reduce((sum, sale) => sum + sale.total, 0);

      return {
        sales: salesWithDates,
        total,
      };
    } catch (error) {
      console.error('Erro ao buscar relatório por período:', error);
      throw new InternalServerErrorException('Erro ao buscar relatório por período');
    }
  }

  async searchSales(query: string) {
    try {
      return await this.prisma.saleItem.findMany({
        where: {
          OR: [
            { sale: { clientName: { contains: query, mode: 'insensitive' } } },
            { id: !isNaN(Number(query)) ? Number(query) : undefined },
            { product: { name: { contains: query, mode: 'insensitive' } } },
          ],
        },
        include: {
          product: true,
        },
      });
    } catch (error) {
      console.error('Erro na busca de vendas:', error);
      throw new InternalServerErrorException('Erro na busca de vendas');
    }
  }

  async getRecentSales(req: Request) {
    if (!req.user) {
      throw new BadRequestException('Usuário não autenticado');
    }
    const companyId = req.user['companyId'];
    try {
      const recentSales= await this.prisma.sale.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          items:{include: { product: true }},
          user: true,
        },
      });
      return recentSales.map(sale => ({
        ...sale,
        createdAt: sale.createdAt.toISOString(),
        updatedAt: sale.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar vendas recentes:', error);
      throw new InternalServerErrorException('Erro ao buscar vendas recentes');
    }
  }
}
