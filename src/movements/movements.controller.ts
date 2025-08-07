// movement.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMovementDto } from './dto/create-movements.dto';
import { MovementService } from './movements.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.docorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movements')
@ApiTags('movements')
export class MovementController {
  constructor(private readonly movementService: MovementService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new movement' })
  @ApiResponse({ status: 201, description: 'Movement created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createMovement(
    @Body() dto: CreateMovementDto,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;

    return this.movementService.createMovement({
      type: dto.type,
      entityType: dto.entityType,
      entityId: dto.entityId,
      description: dto.description,
      details: dto.details,
      company: {
        connect: { id: companyId },
      },
      user: {
        connect: { id: dto.userId },
      },
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get movements by entity type and ID' })
  @ApiResponse({ status: 200, description: 'Movements retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async getMovements(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: number,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.movementService.getMovements(entityType, entityId, companyId);
  }

  @Post('delete')
  @ApiOperation({ summary: 'Delete a movement by ID' })
  @ApiResponse({ status: 200, description: 'Movement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Movement not found' })
  async deleteMovement(
    @Body('id') id: number,
    @Request() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.movementService.deleteMovement(id, companyId);
  }
}
