import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ReturnService } from './return.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateReturnDto } from './dto/create-return-dto';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiTags('return')
@Controller('return')
export class ReturnController {
  constructor(private readonly service: ReturnService) {}

  @Post()
  create(@Body() dto: CreateReturnDto, @Req() req: any) {
    const userId = req.user.id;
    const companyId = req.user.companyId;
    return this.service.create(dto, userId, companyId);
  }

  @Get()
  findAll(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.service.findOne(+id, companyId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.service.delete(+id, companyId);
  }
}
