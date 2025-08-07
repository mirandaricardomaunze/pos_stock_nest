import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({ example: 'company_name', description: 'Chave única da configuração' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'Minha Empresa', description: 'Valor da configuração' })
  @IsString()
  @IsNotEmpty()
  value: string;
}
