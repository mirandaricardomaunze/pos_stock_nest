import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePayrollDto } from './dto/create-payroll.dto';


@Controller('payrolls')
@UseGuards(AuthGuard('jwt'))
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  create(@Body() dto: CreatePayrollDto, @Req() req: any) {
    return this.payrollService.create(dto, req.user);
  }

  @Get('company')
  findAll(@Req() req: any) {
    return this.payrollService.findAllByCompany(req.user.companyId);
  }

  @Get('summary')
  getSummaryByPeriod(
    @Req() req: any,
    @Query('period') period: '1m' | '3m' | '6m' | '1y' = '6m'
  ) {
    return this.payrollService.getSummaryByPeriod(req.user.companyId, period);
  }

  @Get('by-month')
  async findByMonthYear(@Query('month') month: number, @Query('year') year: number) {
    return this.payrollService.findByMonthYear(Number(month), Number(year));
  }
  
  @Get('employee/:id')
  findByEmployee(@Param('id') id: string) {
    return this.payrollService.findByEmployee(Number(id));
  }

  @Patch('pay/:id')
  markAsPaid(@Param('id') id: string, @Req() req: any) {
    return this.payrollService.markAsPaid(Number(id), req.user);
  }


}
