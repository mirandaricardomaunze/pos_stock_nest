import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

async create(createDto: CreateInvoiceDto, companyId: number, issuedById: number) {
  try {
    const order = await this.prisma.order.findUnique({
      where: { id: createDto.orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const existing = await this.prisma.invoice.findUnique({
      where: { orderId: createDto.orderId },
    });
    if (existing) throw new BadRequestException('Invoice already exists for this order');

    const subTotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Ideal: o IVA deveria vir de uma configuração, aqui só um exemplo
    const ivaProduct = await this.prisma.product.findFirst();
    if (!ivaProduct) {
      throw new NotFoundException("O IVA do produto não foi encontrado");
    }

    // Supondo que ivaProduct.iva seja decimal, ex: 0.16 para 16%
    const iva = subTotal * ivaProduct.iva;
    const totalAmount = subTotal + iva;

    return await this.prisma.invoice.create({
      data: {
        orderId: createDto.orderId,
        companyId,
        issuedById,
        iva,
        subTotal,
        totalAmount,
      },
    });
  } catch (error) {
    this.handlePrismaError(error);
  }
}


  async findAll(companyId: number) {
  try {
    const invoices = await this.prisma.invoice.findMany({
      where: { companyId },
      orderBy: { issuedAt: 'desc' },
      include: {
        order: {include:{items:{include:{product:true}}}},
        issuedBy: true,
        company: true,
      },
    });

    const invoicesDetails = invoices.map((invoice) => ({
      ...invoice,
      issuedAtISO: invoice.issuedAt.toISOString(),
      createdAtISO: invoice.createdAt.toISOString(),
      updatedAtISO: invoice.updatedAt.toISOString(),
      orderCreatedAtISO: invoice.order?.createdAt?.toISOString(),
    }));

    return invoicesDetails;
  } catch (error) {
    this.handlePrismaError(error);
  }
}


  async findOne(id: number, companyId: number) {
    try {
      const invoice = await this.prisma.invoice.findFirst({
        where: { id, companyId },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');
      return invoice;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, updateDto: UpdateInvoiceDto, companyId: number) {
    try {
      await this.findOne(id, companyId); // throws if not found
      return await this.prisma.invoice.update({
        where: { id },
        data: updateDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number, companyId: number) {
    try {
      await this.findOne(id, companyId); // throws if not found
      return await this.prisma.invoice.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException('Unique constraint failed');
        case 'P2025':
          throw new NotFoundException('Record to delete does not exist');
        default:
          throw new InternalServerErrorException('Database error');
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new BadRequestException('Validation error');
    }

    throw new InternalServerErrorException(error.message || 'Unexpected error');
  }
}