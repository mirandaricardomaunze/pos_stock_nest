import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return-dto';

@Injectable()
export class ReturnService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReturnDto, userId: number, companyId: number) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: dto.productId,
        companyId,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado ou não pertence à sua empresa');
    }

    if (dto.quantity > product.quantity) {
      throw new BadRequestException(
        'Quantidade de retorno excede o estoque disponível',
      );
    }

    const created = await this.prisma.return.create({
      data: {
        saleId: dto.saleId,
        productId: dto.productId,
        quantity: dto.quantity,
        reason: dto.reason,
        returnedBy: dto.returnedBy,
        carPlate: dto.carPlate,
        processedById: userId,
      },
        include: {
        product: true,
        processedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    });

    await this.prisma.product.update({
      where: {
        id: dto.productId,
        companyId,
      },
      data: {
        quantity: {
          increment: dto.quantity,
        },
      },
    });

    return created;
  }

  async findAll(companyId: number) {
    const returnsSales = await this.prisma.return.findMany({
      where: {
        product: {
          companyId,
        },
      },
      include: {
        sale: true,
        product: true,
        processedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return returnsSales.map((sale) => ({
      ...sale,
      createdAt: sale.createdAt.toISOString(),
    }));
  }

  async findOne(id: number, companyId: number) {
    const retorno = await this.prisma.return.findUnique({
      where: { id },
      include: {
        product: true,
        sale: true,
      },
    });

    if (!retorno || retorno.product.companyId !== companyId) {
      throw new NotFoundException('Devolução não encontrada ou pertence a outra empresa');
    }

    return retorno;
  }

  async delete(id: number, companyId: number) {
    const retorno = await this.prisma.return.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!retorno || retorno.product.companyId !== companyId) {
      throw new NotFoundException('Devolução não encontrada ou pertence a outra empresa');
    }

    await this.prisma.product.update({
      where: {
        id: retorno.productId,
        companyId,
      },
      data: {
        quantity: {
          decrement: retorno.quantity,
        },
      },
    });

    return this.prisma.return.delete({
      where: { id },
    });
  }
}
