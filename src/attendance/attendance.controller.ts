import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo registro de presença (Check-in)' })
  @ApiResponse({ status: 201, description: 'Registro de presença criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao criar registro de presença.' })
  async create(@Body() dto: CreateAttendanceDto, @Req() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new BadRequestException('companyId não encontrado no token');
    }

    return this.attendanceService.create(dto, companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os registros de presença' })
  @ApiResponse({ status: 200, description: 'Lista de presenças retornada com sucesso.' })
  async findAll() {
    return this.attendanceService.findAll();
  }

  @Get('by-employee/:employeeId')
  @ApiOperation({ summary: 'Listar presenças por funcionário' })
  @ApiResponse({ status: 200, description: 'Lista de presenças do funcionário retornada com sucesso.' })
  @ApiResponse({ status: 400, description: 'ID de funcionário inválido.' })
  async findByEmployee(@Param('employeeId') employeeId: string) {
    const id = parseInt(employeeId);
    if (isNaN(id)) throw new BadRequestException('ID de funcionário inválido');
    return this.attendanceService.findByEmployee(id);
  }

  @Get('absences/:employeeId')
  @ApiOperation({ summary: 'Listar faltas por funcionário e mês' })
  @ApiResponse({ status: 200, description: 'Faltas retornadas com sucesso.' })
  async getAbsencesByMonth(
  @Param('employeeId', ParseIntPipe) employeeId: number,
  @Req() req: any,
) {
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);

  if (!year || !month) {
    throw new BadRequestException('Ano e mês são obrigatórios.');
  }

  return this.attendanceService.getAbsencesByMonth(employeeId, year, month);
}


  @Get('active-with-status')
  @ApiOperation({ summary: 'Listar funcionários ativos com status de presença do dia' })
  @ApiResponse({
  status: 200,
  description: 'Funcionários ativos com status de presença retornados com sucesso.'
})
async getActiveWithAttendanceStatus() {
  return this.attendanceService.getActiveWithAttendanceStatus();
}

  @Get('by-date')
  @ApiOperation({ summary: 'Listar presenças por data ou todas' })
  @ApiResponse({ status: 200, description: 'Presenças retornadas com sucesso.' })
  async findByDate(@Req() req: any) {
    const date = req.query.date as string | undefined;
    return this.attendanceService.findByDate(date);
  }
  
  @Get('absences/:employeeId/:year/:month')
  @ApiOperation({ summary: 'Obter faltas do funcionário no mês (sem check-in)' })
  @ApiResponse({ status: 200, description: 'Lista de datas com falta retornada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos.' })
  async getAbsences(
  @Param('employeeId', ParseIntPipe) employeeId: number,
  @Param('year', ParseIntPipe) year: number,
  @Param('month', ParseIntPipe) month: number,
) {
  return this.attendanceService.getEmployeeAbsences(employeeId, year, month);
}

@Get('report')
async getMonthlyReport(
  @Query('month') month: string,
  @Req() req: any
) {
  const companyId = req.user.companyId;
  if (!month) {
    throw new BadRequestException('O parâmetro "month" é obrigatório.');
  }

  return this.attendanceService.getMonthlyReport(companyId, month);
}
  
  @Get(':id')
  @ApiOperation({ summary: 'Buscar presença por ID' })
  @ApiResponse({ status: 200, description: 'Registro de presença encontrado.' })
  @ApiResponse({ status: 404, description: 'Registro de presença não encontrado.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar presença (Check-out)' })
  @ApiResponse({ status: 200, description: 'Registro de presença atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro ao atualizar registro de presença.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar presença' })
  @ApiResponse({ status: 200, description: 'Registro de presença deletado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Registro de presença não encontrado.' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}
