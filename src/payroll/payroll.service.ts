import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PayrollStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { startOfMonth, subMonths } from 'date-fns';
import { AttendanceService } from 'src/attendance/attendance.service';

@Injectable()
export class PayrollService {

  constructor(
    private prisma: PrismaService,
   private readonly attendanceService: AttendanceService
  ) {}

  async create(dto: CreatePayrollDto, reqUser: any) {
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { id: dto.employeeId },
      });

      if (!employee) {
        throw new NotFoundException('Funcionário não encontrado');
      }

      const exists = await this.prisma.payroll.findUnique({
        where: {
          employeeId_month_year: {
            employeeId: dto.employeeId,
            month: dto.month,
            year: dto.year,
          },
        },
      });

      if (exists) {
        throw new ConflictException('Já existe uma folha para este funcionário neste mês e ano');
      }

      const netSalary = dto.baseSalary + dto.bonuses - dto.deductions;

      return await this.prisma.payroll.create({
        data: {
          ...dto,
          netSalary,
          status: PayrollStatus.PENDING,
          companyId: reqUser.companyId,
        },
      });
    } catch (error) {
      console.error('Erro ao criar folha de pagamento:', error);
      throw new InternalServerErrorException('Erro ao criar folha de pagamento');
    }
  }

  async findAllByCompany(companyId: number) {
    return this.prisma.payroll.findMany({
      where: { companyId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByEmployee(employeeId: number) {
    return this.prisma.payroll.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsPaid(payrollId: number, reqUser: any) {
    const payroll = await this.prisma.payroll.findUnique({
      where: { id: payrollId },
    });

    if (!payroll) throw new NotFoundException('Folha de pagamento não encontrada');

    if (payroll.companyId !== reqUser.companyId) {
      throw new BadRequestException('Não autorizado para modificar esta folha');
    }

    if (payroll.status === PayrollStatus.PAID) {
      throw new BadRequestException('Esta folha já foi paga');
    }

    return this.prisma.payroll.update({
      where: { id: payrollId },
      data: {
        status: PayrollStatus.PAID,
        paymentDate: new Date(),
      },
    });
  }

async getSummaryByPeriod(companyId: number, period: string) {
  const monthsMap: Record<string, number> = {
    '1m': 1,
    '3m': 3,
    '6m': 6,
    '1y': 12,
  };
  const monthsBack = monthsMap[period] || 6;
  const startDate = subMonths(startOfMonth(new Date()), monthsBack - 1);

  const payrolls = await this.prisma.$queryRaw<any[]>`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
      EXTRACT(MONTH FROM "createdAt") AS "monthNumber",
      EXTRACT(YEAR FROM "createdAt") AS "yearNumber",
      ARRAY_AGG(DISTINCT "employeeId") AS "employeeIds",
      SUM("netSalary") AS "totalNetSalary",
      COUNT(DISTINCT "employeeId") AS "totalEmployees"
    FROM "Payroll"
    WHERE "companyId" = ${companyId} AND "createdAt" >= ${startDate}
    GROUP BY 1, 2, 3
    ORDER BY 1 ASC
  `;

  const summary = await Promise.all(
    payrolls.map(async (row) => {
      const { monthNumber, yearNumber, employeeIds } = row;

      let totalAbsences = 0;
      let totalHours = 0;

      // Obtém relatório do mês inteiro da empresa
      const monthStr = `${yearNumber}-${String(monthNumber).padStart(2, '0')}`;
      const monthlyReport = await this.attendanceService.getMonthlyReport(companyId, monthStr);

      for (const employeeId of employeeIds) {
        // Soma faltas
        const { total: absences } = await this.attendanceService.getEmployeeAbsences(employeeId, yearNumber, monthNumber);
        totalAbsences += absences;

        // Soma horas
        const employeeReport = monthlyReport.find(r => r.employeeId === employeeId);
        if (employeeReport) {
          totalHours += employeeReport.totalHours;
        }
      }

      return {
        month: row.month,
        totalNetSalary: Number(row.totalNetSalary),
        totalEmployees: Number(row.totalEmployees),
        totalAbsences,
        totalHours: parseFloat(totalHours.toFixed(2)),
      };
    })
  );

  return summary;
}


 async findByMonthYear(month: number, year: number) {
    return this.prisma.payroll.findMany({
      where: { month, year },
      include: { employee: true },
    });
  }
}