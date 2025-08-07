import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateMovementDto {
  @ApiProperty({ example: 'CREATE_SALE', description: 'Tipo de movimento' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Sale', description: 'Tipo da entidade afetada' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ example: 123, description: 'ID da entidade afetada' })
  @IsInt()
  entityId: number;

  @ApiProperty({ example: 'Venda criada com desconto de 10%', description: 'Descrição do movimento' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Detalhes adicionais em JSON' })
  @IsOptional()
  details?: any;

  @ApiProperty({ example: 5, description: 'ID do usuário que realizou o movimento' })
  @IsInt()
  userId: number;
}