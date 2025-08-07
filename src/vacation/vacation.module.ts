import { Module } from '@nestjs/common';
import { VacationController } from './vacation.controller';
import { VacationService } from './vacation.service';

@Module({
    controllers: [VacationController],
    providers: [VacationService],
})
export class VacationModule {}
