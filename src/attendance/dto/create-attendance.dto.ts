import { IsInt, IsOptional } from 'class-validator';

export class CreateAttendanceDto {
  @IsInt()
  employeeId: number;

}
