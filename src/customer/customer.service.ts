import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto, companyId : number   ) {
    try {
      return await this.prisma.customer.create({
        data: {
          ...dto,
          isActive: dto.isActive ?? true,
          company: { connect: { id: companyId } },
        },
      });
    } catch (error) {
      throw new BadRequestException('Erro ao criar cliente: ' + error.message);
    }
  }

  async findAll(companyId: number) {
    try {
      return await this.prisma.customer.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao listar clientes.');
    }
  }

  async findOne(id: number, companyId: number) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async update(id: number, dto: CreateCustomerDto, companyId: number) {
    await this.findOne(id, companyId); // garante que o cliente existe e pertence à empresa

    try {
      return await this.prisma.customer.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar cliente: ' + error.message);
    }
  }

  async remove(id: number, companyId: number) {
    await this.findOne(id, companyId); // garante que o cliente existe

    try {
      return await this.prisma.customer.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('Erro ao excluir cliente: ' + error.message);
    }
  }
}
