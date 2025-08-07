import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
}
