import { Module } from '@nestjs/common';
import { MovementController } from './movements.controller';
import { MovementService } from './movements.service';

@Module({
    controllers: [MovementController],
    providers: [MovementService],
})
export class MovementsModule {}

