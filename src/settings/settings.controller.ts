import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-settings.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as configurações' })
  @ApiResponse({
    status: 200,
    description: 'Lista de configurações retornada com sucesso',
  })
  async findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Buscar uma configuração pelo key' })
  @ApiParam({ name: 'key', description: 'Chave da configuração' })
  @ApiResponse({
    status: 200,
    description: 'Configuração encontrada',
  })
  async findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Atualizar valor de uma configuração' })
  @ApiParam({ name: 'key', description: 'Chave da configuração' })
  @ApiResponse({
    status: 200,
    description: 'Configuração atualizada com sucesso',
  })
  async update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(key, dto);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Configuração criada com sucesso.' })
  @ApiConflictResponse({ description: 'A chave já existe.' })
  @ApiBadRequestResponse({ description: 'Erro de validação.' })
  async create(@Body() dto: UpdateSettingDto) {
    return this.settingsService.create(dto);
  }
}
