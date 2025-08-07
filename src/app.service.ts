import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Informações básicas da aplicação
  getAppInfo() {
    return {
      name: 'POS Stock API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString()
    };
  }

  // Verificação de saúde da aplicação
  healthCheck() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage()
    };
  }

  // Configurações globais da aplicação
  getConfig() {
    return {
      environment: process.env.NODE_ENV || 'development',
      apiVersion: '1.0',
      maxFileSize: '5mb',
      allowedOrigins: ['http://localhost:3000']
    };
  }
}
