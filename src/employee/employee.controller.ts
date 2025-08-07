import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
  UnauthorizedException,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@ApiTags('employees')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo funcionário' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Funcionário criado com sucesso.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Erro ao criar funcionário.' })
  create(
    @Body(new ValidationPipe({ transform: true })) dto: CreateEmployeeDto,
    @Request() req: any
  ) {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    if (!companyId) {
      throw new UnauthorizedException('Empresa não associada ao usuário');
    }

    return this.employeeService.create(dto, userId, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os funcionários' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Funcionários listados com sucesso.' })
  findAll() {
    return this.employeeService.findAll();
  }

    @Get('active-with-attendance')
    @ApiOperation({ summary: 'Listar funcionários ativos com status de presença atual' })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Lista de funcionários ativos com presença em aberto ou não.',
    })
    async getActiveWithAttendance(@Request() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new UnauthorizedException('Usuário não autenticado');
    }
    return this.employeeService.findActiveWithAttendance(companyId);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Listar funcionários por empresa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Funcionários da empresa listados com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Nenhum funcionário encontrado para a empresa.' })
  findByEmployeeCompanyById(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.employeeService.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar funcionário por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Funcionário encontrado.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Funcionário não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar funcionário' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Funcionário atualizado com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Funcionário não encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) dto: CreateEmployeeDto,
  ) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover funcionário' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Funcionário removido com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Funcionário não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.remove(id);
  }

  
}
