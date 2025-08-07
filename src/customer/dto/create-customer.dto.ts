import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  nuit?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

}
