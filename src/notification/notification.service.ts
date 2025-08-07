import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Notification } from '../types/notification'; // Ajuste o caminho conforme necessário

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(notification: Notification): Promise<void> {
    await this.prisma.notification.create({
      data: {
        ...notification,
        companyId: notification.companyId, // Garante que companyId está sendo salvo
      },
    });
  }

  async findPending(userId: number, companyId: number): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        isRead: false,
        userId,
        companyId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: number, userId: number, companyId: number): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id,
        userId,
        companyId,
      },
      data: { isRead: true },
    });
  }

  async countUnread(userId: number, companyId: number): Promise<number> {
    return this.prisma.notification.count({
      where: {
        isRead: false,
        userId,
        companyId,
      },
    });
  }
}
