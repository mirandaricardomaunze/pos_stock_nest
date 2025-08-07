import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client'; // ✅ use o enum do Prisma

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role deve ser: USER, ADMIN, MANAGER, CASHIER, HR ou FINANCE' })
  role?: Role;

  @IsOptional()
  @IsNumber()
  companyId?: number;
}

