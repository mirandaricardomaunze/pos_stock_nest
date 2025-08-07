import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, Supplier } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-suplier.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    try {
      return await this.prisma.supplier.create({
        data: {
          ...createSupplierDto,
          companyId: createSupplierDto.companyId,
        },
      });
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          // Violação de chave estrangeira
          throw new BadRequestException('Empresa informada não existe');
        }
      }

      throw new InternalServerErrorException('Erro ao criar fornecedor');
    }
  }

  async getSuppliers(): Promise<Supplier[]> {
    try {
      const suppliers = await this.prisma.supplier.findMany();

      if (!suppliers.length) {
        throw new NotFoundException('Nenhum fornecedor encontrado');
      }

      return suppliers;
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      throw new InternalServerErrorException('Erro ao buscar fornecedores');
    }
  }

  async getSuppliersByCompany(companyId: number): Promise<Supplier[]> {
    try {
      const suppliers = await this.prisma.supplier.findMany({
        where: { companyId },
      });

      if (!suppliers.length) {
        throw new NotFoundException('Nenhum fornecedor encontrado para esta empresa');
      }

      return suppliers;
    } catch (error) {
      console.error('Erro ao buscar fornecedores por empresa:', error);
      throw new InternalServerErrorException('Erro ao buscar fornecedores');
    }
  }
  
  async findOne(id: number): Promise<Supplier> {
  try {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return supplier;
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    throw new InternalServerErrorException('Erro ao buscar fornecedor');
  }
}
}
