import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'prisma/prisma.service';
 import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, format } from 'date-fns';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttendanceDto, companyId: number) {
    try {
      return await this.prisma.attendance.create({
        data: {
          employeeId: dto.employeeId,
          companyId: companyId,
        },
      });
    } catch (error) {
      throw new BadRequestException('Erro ao criar registro de presença');
    }
  }

  async findAll() {
    return this.prisma.attendance.findMany({
      include: {
        employee: true,
        company: true,
      },
    });
  }

  async findOne(id: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: true,
        company: true,
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Presença com ID ${id} não encontrada`);
    }

    return attendance;
  }

  async update(id: number, dto: UpdateAttendanceDto) {
    try {
      await this.findOne(id); // Garantir que existe

      return await this.prisma.attendance.update({
        where: { id },
        data: {
          checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        },
      });
    } catch (error) {
      throw new BadRequestException('Erro ao atualizar presença');
    }
  }

  async remove(id: number) {
    await this.findOne(id); // Garante que existe antes de remover

    try {
      return await this.prisma.attendance.delete({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao remover presença');
    }
  }

  async findByEmployee(employeeId: number) {
    return await this.prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { checkIn: 'desc' },
      include: {
        employee: true,
        company: true,
      },
    });
  }

  async findByDate(date?: string) {
    const whereCondition = date
      ? {
          checkIn: {
            gte: new Date(`${date}T00:00:00Z`),
            lt: new Date(`${date}T23:59:59Z`),
          },
        }
      : {};

    const attendanceWithDate = await this.prisma.attendance.findMany({
      where: whereCondition,
      include: {
        employee: true,
        company: true,
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    return attendanceWithDate.map((attendance) => ({
      ...attendance,
      checkIn: attendance.checkIn.toISOString(),
      checkOut: attendance.checkOut ? attendance.checkOut.toISOString() : null,
    }));
  }

  // ✅ Verifica se o funcionário já fez check-in hoje
  async hasCheckedInToday(employeeId: number): Promise<boolean> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendance = await this.prisma.attendance.findFirst({
      where: {
        employeeId,
        checkIn: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return !!todayAttendance;
  }

  // ✅ Retorna todos os funcionários ativos com status de presença (aberta) e se já fizeram check-in hoje
  async getActiveWithAttendanceStatus() {
    const activeEmployees = await this.prisma.employee.findMany({
      where: { isActive: true },
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendances = await this.prisma.attendance.findMany({
      where: {
        checkIn: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return activeEmployees.map((emp) => {
      const today = todayAttendances.find((att) => att.employeeId === emp.id);
      return {
        id: emp.id,
        name: emp.fullName,
        position: emp.position,
        departpament: emp.department,
        hasOpenAttendance: !!today && !today.checkOut,
        hasCheckedInToday: !!today,
        lastAttendanceId: today?.id ?? null,
      };
    });
  }

async getEmployeeAbsences(employeeId: number, year: number, month: number): Promise<{ absences: string[], total: number }> {
  // Gerar todos os dias úteis do mês
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(start);
  const workingDays = eachDayOfInterval({ start, end })
    .filter(date =>date.getDay()!==0)
    .map(date => format(date, 'yyyy-MM-dd'));
  const attendances = await this.prisma.attendance.findMany({
    where: {
      employeeId,
      checkIn: {
        gte: start,
        lte: end,
      },
    },
  });

  const attendedDays = new Set(
    attendances.map(a => format(new Date(a.checkIn), 'yyyy-MM-dd'))
  );

  const absences = workingDays.filter(day => !attendedDays.has(day));

  return {
    absences,
    total: absences.length,
  };
}

async getAbsencesByMonth(employeeId: number, year: number, month: number) {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  const allDays = eachDayOfInterval({ start, end })
    .filter(day => !isWeekend(day) || day.getDay() === 6); 

  const attendance = await this.prisma.attendance.findMany({
    where: {
      employeeId,
      checkIn: {
        gte: start,
        lte: end,
      },
    },
    select: {
      checkIn: true,
    },
  });
  const presentDates = new Set(
    attendance.map((a) => format(new Date(a.checkIn), 'yyyy-MM-dd'))
  );
  const absences = allDays
    .map(day => format(day, 'yyyy-MM-dd'))
    .filter(day => !presentDates.has(day));

  return {
    absences,
    total: absences.length,
  };
}

async getMonthlyReport(companyId: number, month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  const start = startOfMonth(new Date(year, monthNumber - 1));
  const end = endOfMonth(start);

  // Pegamos todos os funcionários da empresa
  const employees = await this.prisma.employee.findMany({
    where: {
      companyId,
      isActive: true,
    },
  });

  // Todas as presenças do mês
  const attendance = await this.prisma.attendance.findMany({
    where: {
      companyId,
      checkIn: {
        gte: start,
        lte: end,
      },
    },
  });

  // Dias úteis
  const workingDays = eachDayOfInterval({ start, end })
    .filter(date => date.getDay() !== 0); // Ignora domingos

  return employees.map(emp => {
    const empAttendance = attendance.filter(a => a.employeeId === emp.id);

    const totalDaysPresent = new Set(
      empAttendance.map(a => format(new Date(a.checkIn), 'yyyy-MM-dd'))
    ).size;

    const totalHours = empAttendance.reduce((sum, a) => {
      if (a.checkOut && a.checkIn) {
        const hours =
          (new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime()) /
          (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    const absences = workingDays.length - totalDaysPresent;

    return {
      employeeId: emp.id,
      name: emp.fullName,
      salary: emp.salary,
      totalDaysPresent,
      totalDaysAbsent: absences,
      totalHours: parseFloat(totalHours.toFixed(2)),
    };
  });
}

async getEmployeeHoursWorked(employeeId: number, year: number, month: number): Promise<{ total: number }> {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(start);

  const attendance = await this.prisma.attendance.findMany({
    where: {
      employeeId,
      checkIn: {
        gte: start,
        lte: end,
      },
      checkOut: {
        not: null,
      },
    },
    select: {
      checkIn: true,
      checkOut: true,
    },
  });

  const totalHours = attendance.reduce((sum, record) => {
    if (record.checkIn && record.checkOut) {
      return sum + (record.checkOut.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);
    }
    return sum;
  }, 0);

  return { total: parseFloat(totalHours.toFixed(2)) };
}
}


