import { Body, Controller, Delete, Get, Param, Post,Put } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateCompanyDto } from './dto/create-company.dto';

@Controller('companies')
export class CompanyController {
  constructor( private readonly service:CompanyService){}
  @Get()
  @ApiOperation({ summary: 'Listar todas as empresas' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma empresa por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova empresa' })
  create(@Body() dto: CreateCompanyDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma empresa existente' })
  update(@Param('id') id: string, @Body() dto: CreateCompanyDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma empresa' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
 }

