import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  create(
    @Body(new ValidationPipe({ transform: true })) dto: CreateCustomerDto,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new UnauthorizedException('Usuário sem empresa associada');

    return this.customerService.create(dto, companyId);
  }

  @Get()
  findAll(@Request() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new UnauthorizedException('Usuário sem empresa associada');

    return this.customerService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new UnauthorizedException('Usuário sem empresa associada');

    return this.customerService.findOne(id, companyId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCustomerDto,
    @Request() req: any,
  ) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new UnauthorizedException('Usuário sem empresa associada');

    return this.customerService.update(id, dto, companyId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const companyId = req.user?.companyId;
    if (!companyId) throw new UnauthorizedException('Usuário sem empresa associada');

    return this.customerService.remove(id, companyId);
  }
}
