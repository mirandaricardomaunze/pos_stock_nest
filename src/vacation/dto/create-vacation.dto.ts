import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVacationDto {
  @IsInt()
  employeeId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
  
 @IsOptional()
 @IsInt()
 companyId?: number;
}