import { IsString, IsOptional, IsEmail, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeDepartment } from '@prisma/client'; // Certifique-se de importar isso corretamente

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    enum: EmployeeDepartment,
    description: 'Departamento do funcionário',
  })
  @IsEnum(EmployeeDepartment)
  department: EmployeeDepartment;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  companyId?: number;
}
