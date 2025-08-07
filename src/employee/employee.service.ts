import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { PrismaService } from 'prisma/prisma.service';
import { EmployeeDepartment } from '@prisma/client';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto, userId: number, companyId: number) {
    try {
      return await this.prisma.employee.create({
        data: {
          fullName: dto.fullName,
          position: dto.position,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
          salary: dto.salary,
          isActive: dto.isActive,
          department: dto.department as EmployeeDepartment,
          userId,
          companyId,
        },
      });
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      throw new InternalServerErrorException('Erro ao criar funcionário');
    }
  }

  async findAll() {
    try {
      return await this.prisma.employee.findMany();
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      throw new InternalServerErrorException('Erro ao buscar funcionários');
    }
  }

  async findOne(id: number) {
    try {
      const employee = await this.prisma.employee.findUnique({ where: { id } });

      if (!employee) {
        throw new NotFoundException('Funcionário não encontrado');
      }

      return employee;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('Erro ao buscar funcionário:', error);
      throw new InternalServerErrorException('Erro ao buscar funcionário');
    }
  }

  async update(id: number, data: CreateEmployeeDto) {
    try {
      await this.findOne(id); // Verifica se existe

      const updateData: any = {
        fullName: data.fullName,
        position: data.position,
        email: data.email,
        phone: data.phone,
        address: data.address,
        salary: data.salary,
        isActive: data.isActive,
      };

      if (data.department) {
        updateData.department = data.department as EmployeeDepartment;
      }

      return await this.prisma.employee.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
      throw new InternalServerErrorException('Erro ao atualizar funcionário');
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id); // Verifica se existe

      return await this.prisma.employee.delete({ where: { id } });
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
      throw new InternalServerErrorException('Erro ao remover funcionário');
    }
  }

  async findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    try {
      const employees = await this.prisma.employee.findMany({
        where: { companyId },
      });

      if (!employees || employees.length === 0) {
        throw new NotFoundException('Nenhum funcionário encontrado para esta empresa');
      }

      return employees;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('Erro ao buscar funcionários por empresa:', error);
      throw new InternalServerErrorException('Erro ao buscar funcionários por empresa');
    }
  }

  async findActiveWithAttendance(companyId: number) {
    const employees = await this.prisma.employee.findMany({
      where: {
        isActive: true,
        companyId,
      },
      include: {
        attendances: {
          where: {
            checkOut: null,
          },
          orderBy: {
            checkIn: 'desc',
          },
          take: 1,
        },
      },
    });

    return employees.map((emp) => ({
      id: emp.id,
      name: emp.fullName,
      hasOpenAttendance: emp.attendances.length > 0,
      lastAttendanceId: emp.attendances[0]?.id ?? null,
    }));
  }
}
