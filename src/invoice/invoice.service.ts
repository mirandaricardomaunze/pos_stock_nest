// src/invoice/invoice.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto, userId: number) {
    const { orderId } = dto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Encomenda não encontrada');
    if (order.status !== 'COMPLETED')
      throw new BadRequestException('A encomenda ainda não está concluída');

    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { orderId },
    });
    if (existingInvoice)
      throw new BadRequestException('Fatura já foi emitida para esta encomenda');

    let subTotal = 0;
    const iva = 0.16;

    // Criar venda
    const sale = await this.prisma.sale.create({
      data: {
        userId,
        companyId: order.companyId!,
        iva,
        subTotal: 0,
        total: 0,
        items: {
          create: order.items.map((item) => {
            subTotal += item.price * item.quantity;
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            };
          }),
        },
      },
    });

    const total = subTotal + subTotal * iva;

    await this.prisma.sale.update({
      where: { id: sale.id },
      data: { subTotal, total },
    });

    // Atualizar estoque
    for (const item of order.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Criar fatura
    const invoice = await this.prisma.invoice.create({
      data: {
        orderId: order.id,
        issuedById: userId,
        companyId: order.companyId!,
        totalAmount: total,
        iva,
        subTotal,
        notes: order.notes,
      },
    });

    return {
      message: 'Fatura emitida com sucesso',
      invoice,
    };
  }

  async findAll() {
    return this.prisma.invoice.findMany({
      include: {
        order: true,
        issuedBy: true,
        company: true,
      },
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        order: true,
        issuedBy: true,
        company: true,
      },
    });

    if (!invoice) throw new NotFoundException('Fatura não encontrada');

    return invoice;
  }
}
