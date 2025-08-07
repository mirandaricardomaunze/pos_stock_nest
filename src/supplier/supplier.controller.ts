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
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-suplier.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  async create(
    @Body() createSupplierDto: CreateSupplierDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    if (!user?.companyId) {
      throw new Error('Empresa não encontrada no token do usuário');
    }

    const dtoComEmpresa = {
      ...createSupplierDto,
      companyId: user.companyId,
    };

    return this.supplierService.create(dtoComEmpresa);
  }

  @Get()
  async findByCompany(@Req() req: Request) {
    const user = req.user as any;

    if (!user?.companyId) {
      throw new Error('Empresa não encontrada no token do usuário');
    }

    return this.supplierService.getSuppliersByCompany(user.companyId);
  }

  @Get('all')
  async findAll() {
    return this.supplierService.getSuppliers(); // para administradores ou debug
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findOne(id);
  }
}
