import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

interface JwtUser {
  id: number;
  companyId: number;
}

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private getCompanyIdFromRequest(req: Request): number {
    const user = req.user as JwtUser;
    if (!user?.companyId) {
      throw new BadRequestException('Empresa não encontrada no token do usuário');
    }
    return user.companyId;
  }

  @Post()
  @ApiOperation({ summary: 'Cria um novo produto para a empresa do usuário autenticado' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Empresa não encontrada no token do usuário.' })
  async create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    const user = req.user as JwtUser;
    const companyId = this.getCompanyIdFromRequest(req);
    return this.productsService.createProduct(createProductDto, user.id, companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um produto pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do produto' })
  @ApiBody({ type: CreateProductDto, description: 'Dados parciais do produto para atualização' })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: Partial<CreateProductDto>,
    @Req() req: Request,
  ) {
    const user = req.user as JwtUser;
    return this.productsService.updateProduct(id, updateProductDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclui um produto pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do produto' })
  @ApiResponse({ status: 204, description: 'Produto excluído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as JwtUser;
    await this.productsService.deleteProduct(id, user.id);
    return { message: 'Produto excluído com sucesso' };
  }

  @Get('all')
  @ApiOperation({ summary: 'Lista todos os produtos, independente da empresa' })
  async getAllProducts() {
    return this.productsService.getProducts();
  }

  @Get('company')
  @ApiOperation({ summary: 'Lista todos os produtos da empresa do usuário autenticado' })
  async findByCompany(@Req() req: Request) {
    const companyId = this.getCompanyIdFromRequest(req);
    return this.productsService.getProductsByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um produto pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do produto' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  @Get('count/total')
  @ApiOperation({ summary: 'Retorna o total de produtos da empresa do usuário autenticado' })
  async getTotalProducts(@Req() req: Request) {
    const companyId = this.getCompanyIdFromRequest(req);
    return this.productsService.getTotalProductsByCompany(companyId);
  }

  @Get('count/quantity')
  @ApiOperation({ summary: 'Retorna a soma das quantidades de produtos da empresa do usuário autenticado' })
  async getTotalQuantity(@Req() req: Request) {
    const companyId = this.getCompanyIdFromRequest(req);
    return this.productsService.getTotalQuantityProductsByCompany(companyId);
  }
}
