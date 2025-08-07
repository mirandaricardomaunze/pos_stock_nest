import { Controller, Get, Query, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { DashboardStatsDto } from './dto/create-dashboard.dto';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@UseGuards(JwtAuthGuard) // Protege rota com JWT
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOkResponse({
    description: 'Estatísticas do dashboard retornadas com sucesso',
    type: DashboardStatsDto,
  })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Ano para filtro' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Mês para filtro (1-12)' })
  async getDashboardStats(
    @Request() req: any,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        throw new HttpException('Usuário sem empresa associada', HttpStatus.UNAUTHORIZED);
      }

      // Converter parâmetros query para número
      const y = year ? parseInt(year, 10) : undefined;
      const m = month ? parseInt(month, 10) : undefined;

      return await this.dashboardService.getDashboardStats(companyId, y, m);
    } catch (error) {
      // Pode logar error aqui se quiser
      throw new HttpException('Falha ao carregar dados do dashboard', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
