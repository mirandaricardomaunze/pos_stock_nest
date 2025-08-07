import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.setting.findMany();
  }

  async findOne(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundException('Configuração não encontrada');
    }
    return setting;
  }

  async update(key: string, dto: UpdateSettingDto) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundException('Configuração não encontrada');
    }
    try {
      return await this.prisma.setting.update({
        where: { key },
        data: {
          value: dto.value,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      // Pode logar o erro ou tratar outros tipos de erro aqui
      throw new InternalServerErrorException('Erro ao atualizar configuração');
    }
  }

  async create(dto: UpdateSettingDto) {
    const exists = await this.prisma.setting.findUnique({ where: { key: dto.key } });
    if (exists) {
      throw new ConflictException(`A chave "${dto.key}" já existe.`);
    }

    try {
      return await this.prisma.setting.create({
        data: {
          key: dto.key,
          value: dto.value,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Erro ao criar configuração');
    }
  }
}
