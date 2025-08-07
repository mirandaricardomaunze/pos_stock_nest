import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

interface JwtUser {
  id: number;
  companyId: number;

}

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtUser;

    if (!user.companyId) {
      throw new Error('Empresa não encontrada no token do usuário');
    }

    return this.productsService.createProduct(createProductDto, user.id, user.companyId);
  }
 
   @Get("products-all")
   async getAllProducts(@Req() req: any) {
    const user = req.user as JwtUser;
    if (!user.companyId) {
      throw new Error('Empresa não encontrada no token do usuário');
    }
  {

    return this.productsService.getProducts();
  }
  }

  @Get("company/:companyId")
  async findByCompany(@Req() req: Request) {
    const user = req.user as JwtUser;
    if (!user.companyId) {
      throw new Error('Empresa não encontrada no token do usuário');
    }

    return this.productsService.getProductsByCompany(user.companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  @Get('count/total')
  async getTotalProducts(@Req() req: Request) {
    const user = req.user as JwtUser;
    if (!user.companyId) {
      throw new Error('Empresa não encontrada no token do usuário');
    }
    return this.productsService.getTotalProductsByCompany(user.companyId);
  }

  @Get('count/quantity')
  async getTotalQuantity(@Req() req: Request) {
    const user = req.user as JwtUser;
    if (!user.companyId) {
      throw new Error('Empresa não encontrada no token do usuário');
    }
    return this.productsService.getTotalQuantityProductsByCompany(user.companyId);
  }
}
