import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get application information' })
  getAppInfo() {
    return this.appService.getAppInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check application health' })
  healthCheck() {
    return this.appService.healthCheck();
  }

  @Get('config')
  @ApiOperation({ summary: 'Get application configuration' })
  getConfig() {
    return this.appService.getConfig();
  }
}
