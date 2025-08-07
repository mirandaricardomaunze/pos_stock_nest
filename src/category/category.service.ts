import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Category } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
          company: {
            connect: { id: dto.companyId },
          },
        },
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw new InternalServerErrorException('Erro ao criar categoria');
    }
  }

    async getCategoriesByCompany(companyId: number) {
    try {
      const categories = await this.prisma.category.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      });

      return categories.map(category => ({
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new InternalServerErrorException('Erro ao buscar categorias');
    }
  }
}
