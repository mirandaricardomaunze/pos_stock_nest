import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly service: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova fatura' })
  @ApiResponse({ status: 201, description: 'Fatura criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou fatura já existe' })
  create(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    const companyId = req.user.companyId;
    const issuedById = req.user.id;
    return this.service.create(dto, companyId, issuedById);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as faturas da empresa' })
  @ApiResponse({ status: 200, description: 'Lista de faturas retornada com sucesso' })
  findAll(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.service.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma fatura específica' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Fatura encontrada' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  findOne(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.service.findOne(+id, companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma fatura existente' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Fatura atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.service.update(+id, dto, companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma fatura' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Fatura removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  remove(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.service.remove(+id, companyId);
  }
}