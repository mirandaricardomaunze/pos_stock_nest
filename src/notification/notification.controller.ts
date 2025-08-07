import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('pending')
  async getAll(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { id: userId, companyId } = req.user;

    const notifications = await this.notificationService.findPending(userId, companyId);

    return notifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt?.toISOString(),
    }));
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { id: userId, companyId } = req.user;

    await this.notificationService.markAsRead(id, userId, companyId);

    const count = await this.notificationService.countUnread(userId, companyId);

    return { success: true, unreadCount: count };
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { id: userId, companyId } = req.user;

    const count = await this.notificationService.countUnread(userId, companyId);

    return { count };
  }
}
