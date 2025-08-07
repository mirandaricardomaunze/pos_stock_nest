import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  Request,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order-dto';
import { OrderStatus } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@ApiTags('Pedidos')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo pedido' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      throw new Error('Usuário ou empresa não encontrada no token');
    }

    return this.orderService.create(dto, userId, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  findAll(@Query('status') status: OrderStatus, @Request() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new Error('Empresa não encontrada');
    }
    return this.orderService.findAll(companyId, status);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pedido por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateOrderDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  @Patch(':id/start-processing')
  @ApiOperation({ summary: 'Iniciar processamento do pedido' })
  @ApiParam({ name: 'id', type: Number })
  startProcessing(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.startProcessing(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Concluir o pedido' })
  @ApiParam({ name: 'id', type: Number })
  completeOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.completeOrder(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir pedido' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Listar pedidos recentes da empresa' })
  async getRecentOrders(@Req() req) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new Error('Empresa não encontrada');
    }
    return this.orderService.getRecentOrders(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new Error('Empresa não encontrada');
    }

    const order = await this.orderService.findOneByCompany(id, companyId);

    if (!order) {
      throw new NotFoundException('Pedido não encontrado ou não pertence à empresa');
    }

    return order;
  }
}
