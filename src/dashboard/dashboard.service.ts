import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { DashboardStatsDto } from './dto/create-dashboard.dto';
import {
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns';

@Injectable()
export class DashboardService {
  private readonly LOW_STOCK_THRESHOLD = 10;
  constructor(private readonly prisma: PrismaService) {}

  // Agora recebe opcionalmente year e month para filtro
  async getDashboardStats(
    companyId: number,
    year?: number,
    month?: number,
  ): Promise<DashboardStatsDto> {
    try {
      // Montar filtro de datas dinâmico
      let dateFilter = {};
      if (year && month) {
        // filtro para mês e ano específicos
        const start = startOfMonth(new Date(year, month - 1));
        const end = endOfMonth(new Date(year, month - 1));
        dateFilter = { gte: start, lte: end };
      } else if (year && !month) {
        // filtro para o ano inteiro
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31, 23, 59, 59, 999);
        dateFilter = { gte: start, lte: end };
      }
      // se não passar ano nem mês, dateFilter fica vazio -> sem filtro

      const [totalProducts, totalProfit, lowStock, sales, prevSales, monthlyGrowth] =
        await Promise.all([
          this.getTotalProducts(companyId),
          this.getProfit(companyId, dateFilter),
          this.getLowStockProducts(companyId),
          this.getSales(companyId, dateFilter), // vendas no período filtrado
          this.getPreviousPeriodSales(companyId, year, month), // vendas no período anterior (para comparar)
          this.getMonthlyGrowth(companyId, year, month),
        ]);

      const salesChange = this.calculateChange(sales, prevSales);
      const salesTrend = this.determineTrend(sales, prevSales);

      return {
        totalProducts,
        totalProfit,
        todaySales: this.formatCurrency(sales),
        salesTrend,
        salesChange: this.formatPercentage(salesChange),
        lowStockItems: lowStock,
        stockTrend: 'down',
        stockChange: '+3',
        growthRate: `${monthlyGrowth}%`,
        growthTrend: monthlyGrowth >= 0 ? 'up' : 'down',
        growthChange: `${Math.abs(monthlyGrowth)}%`,
      };
    } catch (error) {
      console.error('Erro no dashboard:', error);
      throw error;
    }
  }

  private async getTotalProducts(companyId: number): Promise<number> {
    try {
      return await this.prisma.product.count({ where: { companyId } });
    } catch (error) {
      console.error('Erro ao contar produtos:', error);
      return 0;
    }
  }

  private async getLowStockProducts(companyId: number): Promise<number> {
    try {
      return await this.prisma.product.count({
        where: {
          companyId,
          quantity: { lt: this.LOW_STOCK_THRESHOLD },
        },
      });
    } catch (error) {
      console.error('Erro ao contar estoque baixo:', error);
      return 0;
    }
  }

  // Obtém vendas no período filtrado (ou total se filtro vazio)
  private async getSales(companyId: number, dateFilter: any): Promise<number> {
    try {
      const whereFilter: any = { companyId };
      if (Object.keys(dateFilter).length > 0) {
        whereFilter.createdAt = dateFilter;
      }

      const result = await this.prisma.sale.aggregate({
        where: whereFilter,
        _sum: { total: true },
      });

      return result._sum?.total || 0;
    } catch (error) {
      console.error('Erro ao calcular vendas:', error);
      return 0;
    }
  }

  // Obtém vendas no período anterior para comparação (mês anterior ou ano anterior)
  private async getPreviousPeriodSales(
    companyId: number,
    year?: number,
    month?: number,
  ): Promise<number> {
    try {
      let prevDateFilter = {};
      if (year && month) {
        // mês anterior
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth === 0) {
          prevMonth = 12;
          prevYear = year - 1;
        }
        const start = startOfMonth(new Date(prevYear, prevMonth - 1));
        const end = endOfMonth(new Date(prevYear, prevMonth - 1));
        prevDateFilter = { gte: start, lte: end };
      } else if (year && !month) {
        // ano anterior
        const start = new Date(year - 1, 0, 1);
        const end = new Date(year - 1, 11, 31, 23, 59, 59, 999);
        prevDateFilter = { gte: start, lte: end };
      }
      // se não passou filtro, pegar ano e mês atual para fazer comparação mensal
      else {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth === 0) {
          prevMonth = 12;
          prevYear--;
        }

        const start = startOfMonth(new Date(prevYear, prevMonth - 1));
        const end = endOfMonth(new Date(prevYear, prevMonth - 1));
        prevDateFilter = { gte: start, lte: end };
      }

      const whereFilter: any = { companyId };
      if (Object.keys(prevDateFilter).length > 0) {
        whereFilter.createdAt = prevDateFilter;
      }

      const result = await this.prisma.sale.aggregate({
        where: whereFilter,
        _sum: { total: true },
      });

      return result._sum?.total || 0;
    } catch (error) {
      console.error('Erro ao calcular vendas período anterior:', error);
      return 0;
    }
  }

  private async getMonthlyGrowth(companyId: number, year?: number, month?: number): Promise<number> {
    try {
      // Se ano e mês definidos, compara mês corrente com anterior
      if (year && month) {
        const currentMonthStart = startOfMonth(new Date(year, month - 1));
        const lastMonthStart = startOfMonth(subMonths(new Date(year, month - 1), 1));
        const lastMonthEnd = endOfMonth(subMonths(new Date(year, month - 1), 1));

        const [currentMonthSales, lastMonthSales] = await Promise.all([
          this.prisma.sale.aggregate({
            where: {
              companyId,
              createdAt: { gte: currentMonthStart },
            },
            _sum: { total: true },
          }),
          this.prisma.sale.aggregate({
            where: {
              companyId,
              createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
            },
            _sum: { total: true },
          }),
        ]);

        const current = currentMonthSales._sum?.total || 0;
        const last = lastMonthSales._sum?.total || 0;

        return this.calculateChange(current, last);
      }

      // Se só ano definido, compara ano corrente com anterior
      if (year && !month) {
        const currentYearStart = new Date(year, 0, 1);
        const lastYearStart = new Date(year - 1, 0, 1);
        const lastYearEnd = new Date(year - 1, 11, 31, 23, 59, 59, 999);

        const [currentYearSales, lastYearSales] = await Promise.all([
          this.prisma.sale.aggregate({
            where: {
              companyId,
              createdAt: { gte: currentYearStart },
            },
            _sum: { total: true },
          }),
          this.prisma.sale.aggregate({
            where: {
              companyId,
              createdAt: { gte: lastYearStart, lte: lastYearEnd },
            },
            _sum: { total: true },
          }),
        ]);

        const current = currentYearSales._sum?.total || 0;
        const last = lastYearSales._sum?.total || 0;

        return this.calculateChange(current, last);
      }

      // Se nada definido, retorna 0 ou compara mês atual e anterior
      return 0;
    } catch (error) {
      console.error('Erro ao calcular crescimento mensal:', error);
      return 0;
    }
  }

  private async getProfit(companyId: number, dateFilter: any = {}): Promise<number> {
    try {
      const whereSale: any = { companyId };
      if (Object.keys(dateFilter).length > 0) {
        whereSale.createdAt = dateFilter;
      }

      const sales = await this.prisma.saleItem.findMany({
        where: {
          sale: whereSale,
        },
        select: {
          quantity: true,
          price: true,
          product: {
            select: {
              purchasePrice: true,
            },
          },
        },
      });

      return sales.reduce((acc, item) => {
        const profit = (item.price - item.product.purchasePrice) * item.quantity;
        return acc + profit;
      }, 0);
    } catch (error) {
      console.error('Erro ao calcular lucro:', error);
      return 0;
    }
  }

  // Métodos auxiliares (mesmos da versão anterior)
  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private determineTrend(current: number, previous: number): 'up' | 'down' | 'neutral' {
    if (previous === 0) return current > 0 ? 'up' : 'neutral';
    if (current > previous * 1.1) return 'up';
    if (current < previous * 0.9) return 'down';
    return 'neutral';
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
    }).format(value);
  }

  private formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }
}
