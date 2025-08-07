import { IsDateString, IsOptional } from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  checkOut?: string;
}
