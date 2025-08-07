import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Role } from '@prisma/client';
import e from 'express';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(data: RegisterDto, avatarFileName?: string) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new UnauthorizedException('Este email já está em uso.');
      }

      const hashed = await bcrypt.hash(data.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashed,
          role: data.role ?? Role.USER,
          createdAt: new Date(),
          companyId: data.companyId,
          avatarUrl: avatarFileName
            ? `/uploads/avatars/${avatarFileName}`
            : undefined,
        },
      });

      return {
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          companyId: user.companyId,
        },
      };
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw new InternalServerErrorException('Erro ao registrar usuário');
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Email ou password está incorrecto!');
      }

      return user;
    } catch (error) {
      console.error('Erro na validação do usuário:', error);
      throw new InternalServerErrorException('Erro ao validar usuário');
    }
  }

  async login(user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
    companyId?: number | null;
    
  }) {
    try {

      const employee = await this.prisma.employee.findFirst({
        where: { userId: user.id },
      });
      const payload = { 
        sub: user.id,
        email: user,
        companyId: user.companyId, 
        employeeId: employee?.id ?? null,
      };

      return {
        access_token: this.jwt.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId ?? null,
          employeeId: employee?.id ?? null,
        },
        message: 'Login feito com sucesso!',
      };
    } catch (error) {
      console.error('Erro ao gerar token de login:', error);
      throw new InternalServerErrorException('Erro ao realizar login');
    }
  }

  async getProfile(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyId: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) throw new NotFoundException('Usuário não encontrado');

      const fullAvatarUrl = user?.avatarUrl
        ? `http://localhost:3000/${user.avatarUrl.replace(/^\/+/, '')}`
        : null;

      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        avatarUrl: fullAvatarUrl,
      };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw new InternalServerErrorException('Erro ao buscar perfil do usuário');
    }
  }

  async updateProfile(userId: number, data: { name: string; email: string }) {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing && existing.id !== userId) {
        throw new BadRequestException('Este e-mail já está em uso por outro usuário.');
      }

      return await this.prisma.user.update({
        where: { id: userId },
        data,
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new InternalServerErrorException('Erro ao atualizar perfil');
    }
  }

  async updateAvatar(userId: number, fileName: string) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          avatarUrl: `/uploads/avatars/${fileName}`,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      throw new InternalServerErrorException('Erro ao atualizar avatar');
    }
  }

  async changePassword(userId: number, dto: UpdatePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const passwordValid = await bcrypt.compare(dto.oldPassword, user.password);
      if (!passwordValid) {
        throw new UnauthorizedException('Senha antiga incorreta');
      }

      if (dto.newPassword !== dto.confirmPassword) {
        throw new BadRequestException('As senhas não coincidem');
      }

      const hashed = await bcrypt.hash(dto.newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });

      return { message: 'Senha atualizada com sucesso' };
    } catch (error) {
      console.error('Erro ao mudar senha:', error);
      throw new InternalServerErrorException('Erro ao alterar senha');
    }
  }

  async assignCompanyToUser(userId: number, companyId: number) {
    try {
      const company = await this.prisma.company.findUnique({ where: { id: companyId } });
      if (!company) {
        throw new NotFoundException('Empresa não encontrada');
      }

      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      return await this.prisma.user.update({
        where: { id: userId },
        data: { companyId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          companyId: true,
          avatarUrl: true,
        },
      });
    } catch (error) {
      console.error('Erro ao associar empresa ao usuário:', error);
      throw new InternalServerErrorException('Erro ao associar empresa ao usuário');
    }
  }
}
