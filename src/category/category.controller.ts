import { Body, Controller, Get, Post, Put, Delete, Param, Query, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoryService.createCategory(dto);
    return { message: 'Categoria criada com sucesso', category };
  }

  @Get()
  async getAll(@Query('companyId') companyId: string) {
    const id = parseInt(companyId);
    if (isNaN(id)) {
      return { message: 'companyId inválido' };
    }
    const categories = await this.categoryService.getCategoriesByCompany(id);
    return categories;
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateCategoryDto>,
  ) {
    const updatedCategory = await this.categoryService.updateCategory(id, dto);
    return { message: 'Categoria atualizada com sucesso', category: updatedCategory };
  }

  // Novo endpoint para deletar categoria por ID
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.deleteCategory(id);
    return { message: 'Categoria excluída com sucesso' };
  }
}
