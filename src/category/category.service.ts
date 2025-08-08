import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
          description: dto.description,
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

  async updateCategory(
    id: number,
    data: Partial<CreateCategoryDto>
  ): Promise<Category> {
    try {
      const existingCategory = await this.prisma.category.findUnique({ where: { id } });
      if (!existingCategory) {
        throw new NotFoundException('Categoria não encontrada');
      }

      return await this.prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      if (error.status === 404) throw error;
      throw new InternalServerErrorException('Erro ao atualizar categoria');
    }
  }

  // Método para deletar categoria por ID
  async deleteCategory(id: number): Promise<void> {
    try {
      const existingCategory = await this.prisma.category.findUnique({ where: { id } });
      if (!existingCategory) {
        throw new NotFoundException('Categoria não encontrada');
      }

      await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      if (error.status === 404) throw error;
      throw new InternalServerErrorException('Erro ao deletar categoria');
    }
  }
}
