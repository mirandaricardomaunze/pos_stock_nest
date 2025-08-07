import { IsInt, IsPositive, Min } from "class-validator";

export class CreatePayrollDto {
  @IsInt()
  employeeId: number;

  @IsInt()
  @Min(1)
  month: number;

  @IsInt()
  @Min(2020)
  year: number;

  @IsPositive()
  baseSalary: number;

  @IsPositive()
  bonuses: number;

  @IsPositive()
  deductions: number;
}