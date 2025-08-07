import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class StockCheckService {
  private readonly logger = new Logger(StockCheckService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkStock(productId: number, userId: number, companyId: number): Promise<void> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        this.logger.warn(`Produto com ID ${productId} não encontrado.`);
        return;
      }

      const lowStock = product.quantity <= 10;

      if (!lowStock) return;

      const alreadyNotified = await this.prisma.notification.findFirst({
        where: {
          ProductId: product.id,
          companyId,
          type: 'low-stock',
          isRead: false,
        },
      });

      if (!alreadyNotified) {
        await this.prisma.notification.create({
          data: {
            type: 'low-stock',
            title: `Baixo estoque: ${product.name}`,
            message: `Estoque atual de ${product.name}: ${product.quantity} unidades.`,
            isRead: false,
            userId,
            companyId,
            ProductId: product.id,
          },
        });

        this.logger.log(`Notificação de baixo estoque criada para o produto: ${product.name}`);
      }
    } catch (error) {
      this.logger.error(`Erro ao verificar estoque do produto ID ${productId}:`, error.stack);
    }
  }
}
