import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSaleDto } from '../sales/dto/create.sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SaleService } from './sales.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova venda' })
  async create(@Body() createSaleDto: CreateSaleDto, @Req() req: Request) {
    try {
      return await this.saleService.create(createSaleDto, req);
    } catch (error) {
      if (error.status === 400 || error.status === 404) {
        throw error;
      }
      console.error('Erro ao criar venda:', error);
      throw new InternalServerErrorException('Erro interno ao criar venda');
    }
  }

  @Get('sales')
  @ApiOperation({ summary: 'Buscar todas as vendas da empresa' })
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new UnauthorizedException('Empresa não encontrada no token');
    }

    return await this.saleService.findAll(req);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Buscar estatísticas de vendas por mês' })
  async getStats() {
    try {
      return await this.saleService.getSalesStatsByMonth();
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new InternalServerErrorException('Erro ao buscar estatísticas');
    }
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Buscar produtos mais vendidos do mês atual' })
  async getTopProducts() {
    try {
      return await this.saleService.getTopProducts();
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error);
      throw new InternalServerErrorException('Erro ao buscar produtos mais vendidos');
    }
  }

  @Get('report')
  @ApiOperation({ summary: 'Relatório de vendas por intervalo de datas' })
  async getReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let start: Date | undefined;
    let end: Date | undefined;

    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Formato inválido para startDate. Use YYYY-MM-DD.');
      }
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Formato inválido para endDate. Use YYYY-MM-DD.');
      }
    }

    try {
      return await this.saleService.getReportByDateRange(start, end);
    } catch (error) {
      if (error.status === 400) {
        throw error;
      }
      console.error('Erro ao buscar relatório:', error);
      throw new InternalServerErrorException('Erro ao buscar relatório');
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar vendas por nome do cliente ou produto' })
  async searchSales(@Query('q') query: string) {
    try {
      return await this.saleService.searchSales(query);
    } catch (error) {
      console.error('Erro na busca de vendas:', error);
      throw new InternalServerErrorException('Erro na busca de vendas');
    }
  }

  @Get('recent')
  @ApiOperation({ summary: 'Buscar vendas recentes da empresa' })
  @UseGuards(AuthGuard('jwt'))
  async getRecent(@Req() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new UnauthorizedException('Empresa não encontrada no token');
    }

    return this.saleService.getRecentSales(req);
  }
}
