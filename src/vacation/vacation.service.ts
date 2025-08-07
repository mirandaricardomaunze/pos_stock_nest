import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVacationDto } from './dto/create-vacation.dto';
import { RequestStatus } from '@prisma/client';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class VacationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVacationDto, reqUser: any) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    if (!employee) throw new NotFoundException('Funcionário não encontrado');

    // Verifica se já passou 1 ano desde a contratação
    const oneYearMs = 1000 * 60 * 60 * 24 * 365;
    if (!employee.startDate || new Date().getTime() - new Date(employee.startDate).getTime() < oneYearMs) {
      throw new BadRequestException('Funcionário ainda não completou 1 ano na empresa');
    }

    const start = parseISO(dto.startDate);
    const end = parseISO(dto.endDate);
    const days = differenceInCalendarDays(end, start) + 1;
    const daysAvailable = employee.vacationDaysLeft || 0;
    if (days > daysAvailable) {
      throw new BadRequestException('Dias solicitados excedem o saldo disponível');
    }

    return this.prisma.vacationRequest.create({
      data: {
        employeeId: dto.employeeId,
        startDate: start,
        endDate: end,
        reason: dto.reason,
        notes: dto.notes,
        status: RequestStatus.PENDING,
        companyId: reqUser.companyId,
      },
    });
  }

  async getByEmployee(employeeId: number) {
    return this.prisma.vacationRequest.findMany({
      where: { employeeId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getByCompany(reqUser: any) {
    return this.prisma.vacationRequest.findMany({
      where: { companyId: reqUser.companyId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: number, reqUser: any) {
    const request = await this.prisma.vacationRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Solicitação não encontrada');

    const employee = await this.prisma.employee.findUnique({ where: { id: request.employeeId } });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');

    const days = differenceInCalendarDays(request.endDate, request.startDate) + 1;
    const daysAvailable = employee.vacationDaysLeft || 0;
    if (days > daysAvailable) {
      throw new BadRequestException('Funcionário não possui dias suficientes para aprovação');
    }

    await this.prisma.$transaction([
      this.prisma.vacationRequest.update({
        where: { id },
        data: {
          status: RequestStatus.APPROVED,
          approvedById: reqUser.userId,
        },
      }),
      this.prisma.employee.update({
        where: { id: request.employeeId },
        data: {
          vacationDaysLeft: { decrement: days },
        },
      }),
    ]);

    return { message: 'Férias aprovadas com sucesso' };
  }

  async reject(id: number, reqUser: any) {
    const request = await this.prisma.vacationRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Solicitação não encontrada');

    return this.prisma.vacationRequest.update({
      where: { id },
      data: {
        status: RequestStatus.REJECTED,
        approvedById: reqUser.userId,
      },
    });
  }
}
