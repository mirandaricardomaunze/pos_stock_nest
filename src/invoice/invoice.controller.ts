// src/invoice/invoice.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth() // mostra que o endpoint exige Bearer token
@ApiTags('Invoices') // cria uma seção "Invoices" no Swagger UI
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova fatura' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, description: 'Fatura criada com sucesso' })
  create(@Body() dto: CreateInvoiceDto, @Request() req) {
    const userId = req.user.id;
    return this.invoiceService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as faturas' })
  @ApiResponse({ status: 200, description: 'Lista de faturas' })
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma fatura pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Fatura encontrada' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.findOne(id);
  }
}
