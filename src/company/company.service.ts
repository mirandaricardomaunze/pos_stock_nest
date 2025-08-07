import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyService {
    constructor(private readonly prisma:PrismaService){}
     async findAll() {
    return this.prisma.company.findMany();
  }

  async findOne(id: number) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }
    return company;
  }

  async create(data: Prisma.CompanyCreateInput) {
    return this.prisma.company.create({ data });
  }

  async update(id: number, data: CreateCompanyDto) {
    await this.ensureExists(id);
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.company.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const exists = await this.prisma.company.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }
  }
}
