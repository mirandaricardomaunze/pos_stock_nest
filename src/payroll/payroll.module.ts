import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { AttendanceService } from 'src/attendance/attendance.service';

@Module({
  providers: [PayrollService,AttendanceService],
  controllers: [PayrollController]
})
export class PayrollModule {}
