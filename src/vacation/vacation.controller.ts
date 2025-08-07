import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { VacationService } from './vacation.service';
import { CreateVacationDto } from './dto/create-vacation.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@ApiTags('Férias')
@ApiBearerAuth()
@Controller('vacations')
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  @Post('request')
  @ApiOperation({ summary: 'Solicitar férias' })
  @ApiBody({ type: CreateVacationDto })
  @ApiResponse({ status: 201, description: 'Pedido de férias criado com sucesso.' })
  async create(@Body() dto: CreateVacationDto, @Req() req) {
    return this.vacationService.create(dto, req.user);
  }

  @Get('by-employee/:employeeId')
  @ApiOperation({ summary: 'Listar pedidos de férias de um funcionário' })
  @ApiParam({ name: 'employeeId', type: Number })
  @ApiResponse({ status: 200 })
  async getByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.vacationService.getByEmployee(employeeId);
  }

  @Get('by-company')
  @ApiOperation({ summary: 'Listar todos os pedidos de férias da empresa' })
  @ApiResponse({ status: 200 })
  async getByCompany(@Req() req) {
    return this.vacationService.getByCompany(req.user);
  }

  @Patch('approve/:id')
  @ApiOperation({ summary: 'Aprovar solicitação de férias' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Solicitação aprovada e dias descontados.' })
  async approve(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.vacationService.approve(id, req.user);
  }

  @Patch('reject/:id')
  @ApiOperation({ summary: 'Rejeitar solicitação de férias' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Solicitação rejeitada.' })
  async reject(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.vacationService.reject(id, req.user);
  }
}
