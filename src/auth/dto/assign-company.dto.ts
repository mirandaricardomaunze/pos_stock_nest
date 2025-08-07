import { IsInt, Min } from 'class-validator';

export class AssignCompanyDto {
  @IsInt()
  @Min(1)
  companyId: number;
}
