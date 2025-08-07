// movement.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Movement } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class MovementService {
  constructor(private prisma: PrismaService) {}

  async createMovement(data: Prisma.MovementCreateInput): Promise<Movement> {
    try {
      return await this.prisma.movement.create({ data });
    } catch (error) {
      throw new Error(`Erro ao criar movimento: ${error.message}`);
    }
  }

  async getMovements(
    entityType: string,
    entityId: number,
    companyId: number,
  ) {
    try {
      const movements = await this.prisma.movement.findMany({
        where: {
          entityType,
          entityId,
          companyId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return movements.map((movement) => ({
        ...movement,
        createdAt: movement.createdAt.toISOString(),
        updatedAt: movement.updatedAt.toISOString(),
      }));
    } catch (error) {
      throw new Error(`Erro ao buscar movimentos: ${error.message}`);
    }
  }

  async deleteMovement(id: number, companyId: number) {
    const movement = await this.prisma.movement.findUnique({
      where: { id },
    });

    if (!movement || movement.companyId !== companyId) {
      throw new NotFoundException('Movimento não encontrado ou não pertence à sua empresa.');
    }

    return this.prisma.movement.delete({ where: { id } });
  }
}
